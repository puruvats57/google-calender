import React from 'react'

export default function DayTile({ date, idx, isCurrentMonth, children }: { date: Date, idx:number, isCurrentMonth:boolean, children?:React.ReactNode }){
  return <div className="cell" data-day-idx={idx} data-date={date.toISOString()}>
    <div className="day-number">{date.getDate()}</div>
    {children}
  </div>
}
