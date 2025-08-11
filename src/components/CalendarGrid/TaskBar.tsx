import React, { useRef } from 'react'
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
}

function ymd(d: Date){ return format(d, 'yyyy-MM-dd') }

export default function TaskBar({ task, gridStartDate, dayWidth, onResize, onMove, openEdit }: Props){
  const start = parseISO(task.startDate)
  const end = parseISO(task.endDate)
  const offsetDays = differenceInCalendarDays(start, gridStartDate)
  const duration = differenceInCalendarDays(end, start) + 1

  const leftPx = offsetDays * dayWidth + 10 // margin
  const widthPx = Math.max(duration * dayWidth - 18, dayWidth * 0.6) // ensure min width

  const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({ id: task.id, data: {task} })

  const ref = useRef<HTMLDivElement|null>(null)

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

  // drop-based move: on drag end we compute offset from pointer location -> new start
  // dnd-kit parent should handle finalization. For simplicity, allow double-click to open edit.
  return <div
    ref={setNodeRef as any}
    className={`task-bar ${task.category === 'To Do' ? 'cat-todo' : task.category === 'In Progress' ? 'cat-progress' : task.category === 'Review' ? 'cat-review' : 'cat-completed'}`}
    style={{ left: leftPx, width: widthPx }}
    title={`${task.name} (${task.startDate} → ${task.endDate})`}
    onDoubleClick={()=>openEdit(task)}
    {...listeners}
    {...attributes}
  >
    <div className="task-left-handle" onPointerDown={startResizeLeft} />
    <div style={{padding:'0 8px', overflow:'hidden', textOverflow:'ellipsis'}}>{task.name}</div>
    <div className="task-right-handle" onPointerDown={startResizeRight} />
  </div>
}
