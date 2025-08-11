import React, { useMemo, useState } from 'react'
import { monthGridDates, formatYMD } from '../../utils/dateUtils'
import DayTile from './DayTile'
import TaskBar from './TaskBar'
import { useTasks } from '../../context/TaskContext'
import TaskModal from '../TaskModal/TaskModal'
import { v4 as uuidv4 } from 'uuid'
import { useDragSelection } from '../../hooks/useDragSelection'

const DAY_WIDTH = 128 // px per cell used for bar width calculations (tune with CSS)

export default function CalendarGrid(){
  const now = new Date()
  const year = now.getFullYear(), month = now.getMonth()
  const gridDates = useMemo(()=> monthGridDates(year, month), [year, month])
  const gridStart = gridDates[0]
  const { tasks, addTask, updateTask } = useTasks()

  // modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [creationRange, setCreationRange] = useState<{startIdx:number,endIdx:number}|null>(null)
  const [editingTask, setEditingTask] = useState<any>(null)

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
  }

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
  }

  // filtered tasks - apply filters and search
  // For demo, rendering all tasks; filters come from context if needed.
  return <div className="calendar">
    <div className="month-header">
      <div className="month-title">{now.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
      <div className="controls">
        {/* optionally add month nav */}
      </div>
    </div>

    <div className="grid">
      {gridDates.map((date, idx) => (
        <div key={idx} onPointerDown={(e)=>onPointerDownTile(idx, e)} className="cell" data-day-idx={idx} data-date={date.toISOString()}>
          <div className="day-number">{date.getDate()}</div>
        </div>
      ))}
    </div>

    {/* Tasks overlay inside calendar — absolute positioned relative to .calendar */}
    <div style={{position:'relative', marginTop: - (gridDates.length>0 ? 110 : 0)}}>
      <div className="tasks-layer" style={{height: 360}}>
        {tasks.map(t => (
          <TaskBar
            key={t.id}
            task={t}
            gridStartDate={gridStart}
            dayWidth={DAY_WIDTH}
            onResize={onResize}
            onMove={(id,newStart) => updateTask(id, { startDate: newStart })}
            openEdit={(task)=>openEdit(task)}
          />
        ))}
      </div>
    </div>

    <TaskModal open={modalOpen} onClose={()=>{ setModalOpen(false); setCreationRange(null); setEditingTask(null) }} onSave={saveEdit} initial={editingTask ?? (creationRange ? { startDate: formatYMD(gridDates[creationRange.startIdx]), endDate: formatYMD(gridDates[creationRange.endIdx]) } : undefined)} />
  </div>
}
