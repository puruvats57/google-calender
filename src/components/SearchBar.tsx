import React from 'react'
import { useTasks } from '../context/TaskContext'

export default function SearchBar(){
  const { search, setSearch } = useTasks() 
  return <div className="search-container">
    <div className="search-icon">🔍</div>
    <input 
      className="search-input"
      placeholder="Search tasks by name..." 
      value={search} 
      onChange={e=>setSearch(e.target.value)} 
    />
  </div>
}
