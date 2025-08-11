import React, { createContext, useContext, useEffect, useState } from 'react'
import { Task, Category } from '../types/taskTypes'
import { formatYMD } from '../utils/dateUtils'

type Filters = {
  categories: Category[],
  weeksWindow: 0 | 1 | 2 | 3
}

type ContextType = {
  tasks: Task[],
  addTask: (t: Task) => void,
  updateTask: (id: string, patch: Partial<Task>) => void,
  deleteTask: (id: string) => void,
  filters: Filters,
  setFilters: (f: Filters) => void,
  search: string,
  setSearch: (s: string) => void
}

const TaskContext = createContext<ContextType | undefined>(undefined)

export const useTasks = () => {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTasks must be used within TaskProvider')
  return ctx
}

const LS_KEY = 'planner_tasks_v1'

export const TaskProvider: React.FC<{children:any}> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const savedTasks = JSON.parse(raw)
        return savedTasks
      }
      return [] // Start with empty list, no demo data
    } catch {
      return [] // Start with empty list on error
    }
  })
  const [filters, setFilters] = useState<Filters>({ categories: [], weeksWindow: 0 as any })
  const [search, setSearch] = useState('')

  // Clear any existing demo data on first load
  useEffect(() => {
    const hasDemoData = tasks.some(task => task.id.startsWith('demo-'))
    if (hasDemoData) {
      setTasks([])
      localStorage.removeItem(LS_KEY)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(tasks))
  }, [tasks])

  function addTask(t: Task){
    setTasks(prev => [...prev, t])
  }
  function updateTask(id: string, patch: Partial<Task>){
    setTasks(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p))
  }
  function deleteTask(id: string){
    setTasks(prev => prev.filter(p => p.id !== id))
  }

  return <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, filters, setFilters, search, setSearch }}>
    {children}
  </TaskContext.Provider>
}
