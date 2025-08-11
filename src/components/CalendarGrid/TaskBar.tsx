import React, { useRef, useState } from 'react'
import { Task } from '../../types/taskTypes'
import { useDraggable } from '@dnd-kit/core'
import { parseISO, differenceInCalendarDays, addDays, format } from 'date-fns'

type Props = {
  task: Task
  gridStartDate: Date
  dayWidth: number
  onResize: (id:string, newStart:string, newEnd:string) => void
  onMove: (id:string, newStart:string) => void
  openEdit: (t: Task) => void
  allTasksForDate?: Task[] // All tasks for this specific date
}

function ymd(d: Date){ return format(d, 'yyyy-MM-dd') }

export default function TaskBar({ task, gridStartDate, dayWidth, onResize, onMove, openEdit, allTasksForDate = [] }: Props){
  const [showTooltip, setShowTooltip] = useState(false)
  const start = parseISO(task.startDate)
  const end = parseISO(task.startDate)
  
  // Calculate duration for width
  const duration = differenceInCalendarDays(parseISO(task.endDate), start) + 1
  
  // Calculate width based on duration
  const widthPx = Math.max(duration * dayWidth - 10, dayWidth * 0.8)
  
  // Constrain the width to prevent overflow
  const maxWidth = Math.min(widthPx, (7 * dayWidth) - 10) // Max 7 days width
  const constrainedWidth = Math.max(maxWidth, dayWidth * 0.8) // Ensure minimum width

  const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({ 
    id: task.id, 
    data: {task} 
  })

  const ref = useRef<HTMLDivElement|null>(null)

  // Check if there are multiple tasks for this date
  const hasMultipleTasks = allTasksForDate.length > 1
  const taskCount = allTasksForDate.length

  // left resize
  function startResizeLeft(e: React.PointerEvent){
    e.stopPropagation()
    const startX = e.clientX
    const origStart = parseISO(task.startDate)
    const onPointerMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX
      const dayDelta = Math.round(dx / dayWidth)
      const newStart = addDays(origStart, dayDelta)
      if(newStart <= parseISO(task.endDate)) onResize(task.id, ymd(newStart), task.endDate)
    }
    const onPointerUp = () => { window.removeEventListener('pointermove', onPointerMove); window.removeEventListener('pointerup', onPointerUp); }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  // right resize
  function startResizeRight(e: React.PointerEvent){
    e.stopPropagation()
    const startX = e.clientX
    const origEnd = parseISO(task.endDate)
    const onPointerMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX
      const dayDelta = Math.round(dx / dayWidth)
      const newEnd = addDays(origEnd, dayDelta)
      if(newEnd >= parseISO(task.startDate)) onResize(task.id, task.startDate, ymd(newEnd))
    }
    const onPointerUp = () => { window.removeEventListener('pointermove', onPointerMove); window.removeEventListener('pointerup', onPointerUp); }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  const style = {
    width: constrainedWidth,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1
  }

  return (
    <div
      ref={setNodeRef as any}
      className={`task-bar ${task.category === 'To Do' ? 'cat-todo' : task.category === 'In Progress' ? 'cat-progress' : task.category === 'Review' ? 'cat-review' : 'cat-completed'}`}
      style={style}
      title={`${task.name} (${task.startDate} → ${task.endDate})`}
      onDoubleClick={()=>openEdit(task)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      {...listeners}
      {...attributes}
    >
      <div className="task-left-handle" onPointerDown={startResizeLeft} />
      <div style={{padding:'0 8px', overflow:'hidden', textOverflow:'ellipsis', flex: 1}}>
        {task.name}
        {hasMultipleTasks && (
          <span className="task-count"> +{taskCount - 1}</span>
        )}
      </div>
      <div className="task-right-handle" onPointerDown={startResizeRight} />
      
      {/* Tooltip showing all tasks for this date */}
      {showTooltip && hasMultipleTasks && (
        <div className="task-tooltip">
          <div className="tooltip-header">Tasks for {format(start, 'MMM d')}:</div>
          {allTasksForDate.map((t, index) => (
            <div key={t.id} className="tooltip-task" onClick={() => openEdit(t)}>
              <span className="tooltip-task-name">{t.name}</span>
              <span className={`tooltip-task-category ${t.category === 'To Do' ? 'cat-todo' : t.category === 'In Progress' ? 'cat-progress' : t.category === 'Review' ? 'cat-review' : 'cat-completed'}`}>
                {t.category}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
