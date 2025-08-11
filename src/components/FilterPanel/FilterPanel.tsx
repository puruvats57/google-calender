import React from 'react'
import { useTasks } from '../../context/TaskContext'
import { Category } from '../../types/taskTypes'

export default function FilterPanel(){
  const { filters, setFilters } = useTasks()

  const categories: Category[] = ['To Do','In Progress','Review','Completed']

  function toggleCat(c: Category){
    const set = new Set(filters.categories)
    if(set.has(c)) set.delete(c) ; else set.add(c)
    setFilters({...filters, categories: Array.from(set)})
  }

  function setWeeks(w: 0|1|2|3){
    setFilters({...filters, weeksWindow: w})
  }

  return <div>
    <div className="filter-section">
      <h4>Categories</h4>
      {categories.map(c => <label key={c} style={{display:'block', marginBottom:6}}>
        <input type="checkbox" checked={filters.categories.includes(c)} onChange={()=>toggleCat(c)} /> {' '}
        {c}
      </label>)}
    </div>

    <div className="filter-section">
      <h4>Time Window</h4>
      <label><input type="radio" checked={filters.weeksWindow===0} onChange={()=>setWeeks(0)} /> All</label><br/>
      <label><input type="radio" checked={filters.weeksWindow===1} onChange={()=>setWeeks(1)} /> 1 week</label><br/>
      <label><input type="radio" checked={filters.weeksWindow===2} onChange={()=>setWeeks(2)} /> 2 weeks</label><br/>
      <label><input type="radio" checked={filters.weeksWindow===3} onChange={()=>setWeeks(3)} /> 3 weeks</label>
    </div>
  </div>
}
