"use client";

import React, { useState, useEffect } from "react";
import { format, addMonths, subMonths, isSameDay, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Swiper, SwiperSlide } from 'swiper/react';
import { MoreVertical } from "lucide-react";
import 'swiper/css';
import { Plantao, Local } from "@/types";

interface CustomCalendarProps {
  date: Date | null;
  onDateChange: (date: Date | null) => void;
  plantoes: Plantao[];
  locais: Local[];
  month: Date;
  onMonthChange: (month: Date) => void;
}

export function CustomCalendar({ 
  date, 
  onDateChange, 
  plantoes, 
  locais, 
  month, 
  onMonthChange 
}: CustomCalendarProps) {
  const [calendarDays, setCalendarDays] = useState<Array<{ date: Date; isCurrentMonth: boolean }>>([]);

  useEffect(() => {
    const days = [];
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    
    const startDay = firstDay.getDay() === 0 ? 7 : firstDay.getDay();
    for (let i = startDay - 1; i > 0; i--) {
      const prevDate = new Date(year, monthIndex, 1 - i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, monthIndex, i);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    
    const endDay = lastDay.getDay() === 0 ? 7 : lastDay.getDay();
    const daysToAdd = (days.length <= 35) ? 42 - days.length : 7 - endDay;
    for (let i = 1; i <= daysToAdd; i++) {
      const nextDate = new Date(year, monthIndex + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    setCalendarDays(days);
  }, [month]);

  const getPlantoesNaData = (date: Date) => {
    return plantoes.filter(plantao => isSameDay(new Date(plantao.data), date));
  };

  const getCoresPlantoes = (plantoesNaData: Plantao[]) => {
    return plantoesNaData.map(plantao => {
      const local = locais.find(l => l.id === plantao.local);
      return local?.cor || "hsl(var(--purple))";
    });
  };

  return (
    <div className="calendar-container overflow-hidden max-w-2xl w-full mx-auto">
      <div className="bg-purple rounded-t-2xl p-4 text-white">
        <div className="mb-2 flex justify-center">
          <h2 className="text-2xl text-white text-center">
            {month.getFullYear()}
          </h2>
        </div>
        
        <div className="relative">
          <Swiper
            onSlideChange={(swiper) => {
              const newMonth = swiper.activeIndex > swiper.previousIndex
                ? addMonths(month, 1)
                : subMonths(month, 1);
              onMonthChange(newMonth);
            }}
            initialSlide={2}
            slidesPerView={3.5}
            centeredSlides={true}
            spaceBetween={10}
            className="month-swiper"
          >
            <SwiperSlide>
              <button 
                onClick={() => onMonthChange(subMonths(month, 2))}
                className="text-white/70 text-center w-full py-2 font-light text-2xl"
              >
                {format(subMonths(month, 2), 'MMMM', { locale: ptBR })}
              </button>
            </SwiperSlide>
            <SwiperSlide>
              <button 
                onClick={() => onMonthChange(subMonths(month, 1))}
                className="text-white/70 text-center w-full py-2 font-light text-2xl"
              >
                {format(subMonths(month, 1), 'MMMM', { locale: ptBR })}
              </button>
            </SwiperSlide>
            <SwiperSlide>
              <div className="text-white text-center w-full py-2 font-bold text-3xl">
                {format(month, 'MMMM', { locale: ptBR })}
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <button 
                onClick={() => onMonthChange(addMonths(month, 1))}
                className="text-white/70 text-center w-full py-2 font-light text-2xl"
              >
                {format(addMonths(month, 1), 'MMMM', { locale: ptBR })}
              </button>
            </SwiperSlide>
            <SwiperSlide>
              <button 
                onClick={() => onMonthChange(addMonths(month, 2))}
                className="text-white/70 text-center w-full py-2 font-light text-2xl"
              >
                {format(addMonths(month, 2), 'MMMM', { locale: ptBR })}
              </button>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
      
      <div className="bg-white rounded-b-2xl p-4">
        <div className="grid grid-cols-7 mb-2">
          {['d', 's', 't', 'q', 'q', 's', 's'].map((day, index) => (
            <div key={index} className="text-center text-xs text-indigo-300 font-normal">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((dayInfo, index) => {
            const isToday = isSameDay(dayInfo.date, new Date());
            const isSelected = date && isSameDay(dayInfo.date, date);
            const plantoesNaData = getPlantoesNaData(dayInfo.date);
            const cores = getCoresPlantoes(plantoesNaData);
            
            return (
              <button
                key={index}
                className={`
                  relative h-10 w-10 rounded-full flex flex-col items-center justify-center mx-auto
                  ${!dayInfo.isCurrentMonth ? 'text-gray-300' : ''}
                  ${isSelected ? 'bg-purple text-white font-medium' : ''}
                  ${isToday && !isSelected ? 'bg-gray-100 font-medium' : ''}
                `}
                onClick={() => {
                  if (date && isSameDay(dayInfo.date, date)) {
                    onDateChange(null);
                  } else {
                    onDateChange(dayInfo.date);
                  }
                }}
                disabled={!dayInfo.isCurrentMonth}
              >
                <span>{dayInfo.date.getDate()}</span>
                
                {plantoesNaData.length > 0 && (
                  <div className="absolute -bottom-1 flex gap-[2px] justify-center">
                    {cores.slice(0, 3).map((cor, i) => (
                      <div 
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: cor }}
                      />
                    ))}
                    {plantoesNaData.length > 3 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      <style jsx global>{`
        .month-swiper {
          padding: 0.5rem 0;
        }
      `}</style>
    </div>
  );
}
