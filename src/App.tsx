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
        <h2 style={{marginTop:0, color: '#1e293b', fontSize: '24px'}}>Task Planner</h2>
        <div style={{border: '1px solid red', padding: '10px', margin: '10px 0'}}>
          <SearchBar />
        </div>
        <div style={{border: '1px solid blue', padding: '10px', margin: '10px 0'}}>
          <FilterPanel />
        </div>
        <div style={{marginTop:20, padding: '16px', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
          <h4 style={{margin: '0 0 12px 0', color: '#1e293b'}}>How to Use</h4>
          <div style={{color:'#64748b', fontSize: '13px', lineHeight: '1.5'}}>
            <p style={{margin: '0 0 8px 0'}}>• <strong>Create:</strong> Drag across calendar cells to create tasks</p>
            <p style={{margin: '0 0 8px 0'}}>• <strong>Edit:</strong> Double-click a task to modify</p>
            <p style={{margin: '0 0 8px 0'}}>• <strong>Move:</strong> Drag tasks to reschedule them</p>
            <p style={{margin: '0 0 8px 0'}}>• <strong>Resize:</strong> Drag handles to adjust duration</p>
            <p style={{margin: '0 0 0 0'}}>• <strong>Filter:</strong> Use checkboxes and time filters above</p>
          </div>
        </div>
      </div>

      <div style={{flex:1}}>
        <CalendarGrid />
      </div>
    </div>
  </TaskProvider>
}
