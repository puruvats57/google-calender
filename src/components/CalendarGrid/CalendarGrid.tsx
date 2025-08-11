import React, { useMemo, useState } from 'react'
import { monthGridDates, formatYMD } from '../../utils/dateUtils'
import DayTile from './DayTile'
import TaskBar from './TaskBar'
import { useTasks } from '../../context/TaskContext'
import TaskModal from '../TaskModal/TaskModal'
import { v4 as uuidv4 } from 'uuid'
import { useDragSelection } from '../../hooks/useDragSelection'
import { parseISO, addWeeks, isWithinInterval, addDays, differenceInCalendarDays } from 'date-fns'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor, useDroppable } from '@dnd-kit/core'
import { Task } from '../../types/taskTypes'

const DAY_WIDTH = 128 // px per cell used for bar width calculations (tune with CSS)

// Droppable cell component
function DroppableCell({ date, idx, onPointerDown, isToday, children }: { 
  date: Date, 
  idx: number, 
  onPointerDown: (idx: number, e: React.PointerEvent) => void,
  isToday: boolean,
  children?: React.ReactNode
}) {
  const { setNodeRef } = useDroppable({
    id: `cell-${idx}`,
    data: {
      type: 'cell',
      element: null,
      dayIdx: idx,
      date: date
    }
  })

  return (
    <div 
      ref={setNodeRef}
      onPointerDown={(e) => onPointerDown(idx, e)} 
      className="cell" 
      data-day-idx={idx} 
      data-date={date.toISOString()}
    >
      <div className="day-number">{date.getDate()}</div>
      {/* Highlight today with a blue circle */}
      {isToday && (
        <div className="dot-event">
          {date.getDate()}
        </div>
      )}
      {/* Render tasks in this cell */}
      {children}
    </div>
  )
}

export default function CalendarGrid(){
  const now = new Date()
  const year = now.getFullYear(), month = now.getMonth()
  const gridDates = useMemo(()=> monthGridDates(year, month), [year, month])
  const gridStart = gridDates[0]
  const { tasks, addTask, updateTask, filters, search } = useTasks()

  // modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [creationRange, setCreationRange] = useState<{startIdx:number,endIdx:number}|null>(null)
  const [editingTask, setEditingTask] = useState<any>(null)

  // DnD state
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const sensors = useSensors(useSensor(PointerSensor))

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks

    // Apply category filters
    if (filters.categories.length > 0) {
      filtered = filtered.filter(task => filters.categories.includes(task.category))
    }

    // Apply time window filters
    if (filters.weeksWindow > 0) {
      const now = new Date()
      const endDate = addWeeks(now, filters.weeksWindow)
      filtered = filtered.filter(task => {
        const taskStart = parseISO(task.startDate)
        const taskEnd = parseISO(task.endDate)
        return isWithinInterval(taskStart, { start: now, end: endDate }) ||
               isWithinInterval(taskEnd, { start: now, end: endDate }) ||
               (taskStart <= now && taskEnd >= endDate)
      })
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(task => 
        task.name.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [tasks, filters, search])

  function onSelect(startIdx:number, endIdx:number){
    setCreationRange({startIdx, endIdx})
    setModalOpen(true)
  }

  const { start } = useDragSelection(onSelect)

  function createTaskSave(payload: any){
    if(!creationRange) return
    
    const startDate = formatYMD(gridDates[creationRange.startIdx])
    const endDate = formatYMD(gridDates[creationRange.endIdx])
    
    const t = {
      id: uuidv4(),
      name: payload.name,
      category: payload.category,
      startDate,
      endDate
    }
    
    addTask(t)
    setCreationRange(null)
    setModalOpen(false)
  }

  // Group tasks by their start date for display
  const tasksByDate = useMemo(() => {
    const grouped: { [key: string]: Task[] } = {}
    filteredTasks.forEach(task => {
      // For each day the task spans, add it to that day's group
      const start = parseISO(task.startDate)
      const end = parseISO(task.endDate)
      const duration = differenceInCalendarDays(end, start) + 1
      
      for (let i = 0; i < duration; i++) {
        const currentDate = addDays(start, i)
        const dateKey = formatYMD(currentDate)
        if (!grouped[dateKey]) {
          grouped[dateKey] = []
        }
        grouped[dateKey].push(task)
      }
    })
    return grouped
  }, [filteredTasks])

  // Get tasks to display for each date
  const displayTasks = useMemo(() => {
    const display: Task[] = []
    Object.values(tasksByDate).forEach(tasks => {
      if (tasks.length > 0) {
        // Show first task for each date, others will be shown on hover
        display.push(tasks[0])
      }
    })
    return display
  }, [tasksByDate])

  function onResize(id:string, newStart:string, newEnd:string){
    updateTask(id, { startDate: newStart, endDate: newEnd })
  }

  // click on tile to begin selection
  function onPointerDownTile(idx:number, e: React.PointerEvent){
    // start drag selection
    start(idx)
  }

  // open edit on double click is implemented in TaskBar double click -> setEditingTask
  function openEdit(task:any){
    setEditingTask(task)
    setModalOpen(true)
  }

  function saveEdit(p: any){
    if(editingTask){
      updateTask(editingTask.id, { name: p.name, category: p.category })
      setEditingTask(null)
    } else {
      createTaskSave(p)
    }
    setModalOpen(false)
  }

  // Check if a date is today
  const isToday = (date: Date) => {
    return date.toDateString() === now.toDateString()
  }

  // Handle DnD events
  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.data.current?.task) {
      const task = active.data.current.task as Task
      
      // Get the target cell data
      const targetData = over.data.current
      if (targetData && targetData.type === 'cell' && targetData.dayIdx !== undefined) {
        const targetIdx = targetData.dayIdx
        const targetDate = gridDates[targetIdx]
        const taskDuration = differenceInCalendarDays(parseISO(task.endDate), parseISO(task.startDate))
        
        // Calculate new start and end dates
        const newStartDate = formatYMD(targetDate)
        const newEndDate = formatYMD(addDays(targetDate, taskDuration))
        
        // Update the task
        updateTask(task.id, { 
          startDate: newStartDate, 
          endDate: newEndDate 
        })
      }
    }
    
    setActiveTask(null)
  }

  return (
    <DndContext 
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="calendar">
        <div className="month-header">
          <div className="month-title">{now.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
          <div className="controls">
            {/* Month navigation can be added here later */}
          </div>
        </div>

        <div className="grid">
          {gridDates.map((date, idx) => (
            <DroppableCell
              key={idx}
              date={date}
              idx={idx}
              onPointerDown={onPointerDownTile}
              isToday={isToday(date)}
            >
              {/* Render tasks directly in this cell */}
              {tasksByDate[formatYMD(date)]?.map((task, taskIndex) => (
                <TaskBar
                  key={task.id}
                  task={task}
                  gridStartDate={gridStart}
                  dayWidth={DAY_WIDTH}
                  onResize={onResize}
                  onMove={(id,newStart) => updateTask(id, { startDate: newStart })}
                  openEdit={(task)=>openEdit(task)}
                  allTasksForDate={tasksByDate[formatYMD(date)] || []}
                />
              ))}
            </DroppableCell>
          ))}
        </div>

        {/* Remove the tasks overlay since we're now rendering tasks directly in cells */}

        <TaskModal open={modalOpen} onClose={()=>{ setModalOpen(false); setCreationRange(null); setEditingTask(null) }} onSave={saveEdit} initial={editingTask ?? (creationRange ? { startDate: formatYMD(gridDates[creationRange.startIdx]), endDate: formatYMD(gridDates[creationRange.endIdx]) } : undefined)} />
      </div>

      {/* Drag overlay for visual feedback */}
      <DragOverlay>
        {activeTask ? (
          <div 
            className={`task-bar ${activeTask.category === 'To Do' ? 'cat-todo' : activeTask.category === 'In Progress' ? 'cat-progress' : activeTask.category === 'Review' ? 'cat-review' : 'cat-completed'}`}
            style={{
              width: Math.max((differenceInCalendarDays(parseISO(activeTask.endDate), parseISO(activeTask.startDate)) + 1) * DAY_WIDTH - 18, DAY_WIDTH * 0.6),
              height: 28,
              borderRadius: 14,
              padding: '4px 12px',
              display: 'inline-flex',
              alignItems: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: 12,
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              opacity: 0.8
            }}
          >
            {activeTask.name}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
