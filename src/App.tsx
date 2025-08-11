import React from 'react'
import { TaskProvider } from './context/TaskContext'
import './assets/style.css'
import CalendarGrid from './components/CalendarGrid/CalendarGrid'
import FilterPanel from './components/FilterPanel/FilterPanel'
import SearchBar from './components/SearchBar'

export default function App(){
  return <TaskProvider>
    <div className="app">
      <div className="sidebar">
        <h2 style={{marginTop:0}}>Filters</h2>
        <SearchBar />
        <FilterPanel />
        <div style={{marginTop:20}}>
          <h4>Notes</h4>
          <p style={{color:'#556'}}>Drag across calendar cells to create tasks, double click a task to edit, drag handles to resize.</p>
        </div>
      </div>

      <div style={{flex:1}}>
        <CalendarGrid />
      </div>
    </div>
  </TaskProvider>
}
