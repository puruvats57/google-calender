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

  return <div className="filter-panel">
    <div className="filter-section">
      <h4>Categories</h4>
      <div className="category-filters">
        {categories.map(c => (
          <label key={c} className="filter-checkbox">
            <input 
              type="checkbox" 
              checked={filters.categories.includes(c)} 
              onChange={()=>toggleCat(c)} 
            />
            <span className="checkbox-label">{c}</span>
          </label>
        ))}
      </div>
    </div>

    <div className="filter-section">
      <h4>Time Window</h4>
      <div className="time-filters">
        <label className="filter-radio">
          <input 
            type="radio" 
            checked={filters.weeksWindow===0} 
            onChange={()=>setWeeks(0)} 
          />
          <span className="radio-label">All tasks</span>
        </label>
        <label className="filter-radio">
          <input 
            type="radio" 
            checked={filters.weeksWindow===1} 
            onChange={()=>setWeeks(1)} 
          />
          <span className="radio-label">Within 1 week</span>
        </label>
        <label className="filter-radio">
          <input 
            type="radio" 
            checked={filters.weeksWindow===2} 
            onChange={()=>setWeeks(2)} 
          />
          <span className="radio-label">Within 2 weeks</span>
        </label>
        <label className="filter-radio">
          <input 
            type="radio" 
            checked={filters.weeksWindow===3} 
            onChange={()=>setWeeks(3)} 
          />
          <span className="radio-label">Within 3 weeks</span>
        </label>
      </div>
    </div>
  </div>
}
