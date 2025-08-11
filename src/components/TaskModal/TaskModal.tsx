import React, { useEffect, useState } from 'react'
import { Category, Task } from '../../types/taskTypes'

type Props = {
  open: boolean
  onClose: ()=>void
  onSave: (task: Omit<Task,'id'> & { id?: string }) => void
  initial?: Partial<Task> & { startDate: string; endDate: string }
}

const categories: Category[] = ['To Do','In Progress','Review','Completed']

export default function TaskModal({ open, onClose, onSave, initial }: Props){
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<Category>(initial?.category ?? 'To Do')

  useEffect(()=>{ if(open){ setName(initial?.name ?? ''); setCategory(initial?.category ?? 'To Do') } }, [open])

  if(!open) return null
  return <div className="modal-backdrop">
    <div className="modal">
      <h3>{initial?.id ? 'Edit Task' : 'Create Task'}</h3>
      <div className="form-row">
        <label>Task name</label>
        <input value={name} onChange={e=>setName(e.target.value)} />
      </div>
      <div className="form-row">
        <label>Category</label>
        <select value={category} onChange={e=>setCategory(e.target.value as Category)}>
          {categories.map(c=> <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
        <button onClick={onClose}>Cancel</button>
        <button onClick={()=>{ if(!name) return alert('name required'); onSave({ ...(initial ?? {}), name, category } as any); onClose() }} style={{background:'#06a1ea', color:'white', padding:'8px 12px', borderRadius:8}}>Save</button>
      </div>
    </div>
  </div>
}
