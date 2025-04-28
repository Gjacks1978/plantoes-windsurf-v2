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
  onDateChange: (date: Date) => void;
  plantoes: Plantao[];
  locais: Local[];
}

export function CustomCalendar({ date, onDateChange, plantoes, locais }: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(date || new Date());
  const [calendarDays, setCalendarDays] = useState<Array<{ date: Date; isCurrentMonth: boolean }>>([]);

  // Gera os dias do calendário para o mês atual
  useEffect(() => {
    const days = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1);
    // Último dia do mês
    const lastDay = new Date(year, month + 1, 0);
    
    // Dias do mês anterior para completar a primeira semana
    const startDay = firstDay.getDay() || 7; // Domingo é 0, convertemos para 7
    for (let i = startDay - 1; i > 0; i--) {
      const prevDate = new Date(year, month, 1 - i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Dias do mês atual
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    
    // Dias do próximo mês para completar a última semana
    const endDay = lastDay.getDay() || 7; // Domingo é 0, convertemos para 7
    for (let i = 1; i <= 7 - endDay; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    setCalendarDays(days);
  }, [currentMonth]);

  // Verifica se há plantões na data
  const getPlantoesNaData = (date: Date) => {
    return plantoes.filter(plantao => isSameDay(new Date(plantao.data), date));
  };

  // Obtém as cores dos locais dos plantões
  const getCoresPlantoes = (plantoesNaData: Plantao[]) => {
    return plantoesNaData.map(plantao => {
      const local = locais.find(l => l.id === plantao.local);
      return local?.cor || "hsl(var(--purple))";
    });
  };

  return (
    <div className="calendar-container overflow-hidden">
      {/* Cabeçalho do calendário com estilo roxo */}
      <div className="bg-purple rounded-t-2xl p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-light">
            {format(currentMonth, 'yyyy', { locale: ptBR })}
          </h2>
          {/* Botão removido conforme solicitado */}
          {/* <button className="p-1 rounded-full hover:bg-purple-dark transition">
            <MoreVertical size={20} />
          </button> */}
        </div>
        
        {/* Meses com swipe */}
        <div className="relative">
          <Swiper
            onSlideChange={(swiper) => {
              const newMonth = swiper.activeIndex > swiper.previousIndex
                ? addMonths(currentMonth, 1)
                : subMonths(currentMonth, 1);
              setCurrentMonth(newMonth);
            }}
            initialSlide={2}
            slidesPerView={3.5}
            centeredSlides={true}
            spaceBetween={10}
            className="month-swiper"
          >
            <SwiperSlide>
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 2))}
                className="text-white/70 text-center w-full py-2 font-light"
              >
                {format(subMonths(currentMonth, 2), 'MMMM', { locale: ptBR })}
              </button>
            </SwiperSlide>
            <SwiperSlide>
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="text-white/70 text-center w-full py-2 font-light"
              >
                {format(subMonths(currentMonth, 1), 'MMMM', { locale: ptBR })}
              </button>
            </SwiperSlide>
            <SwiperSlide>
              <div className="text-white text-center w-full py-2 font-medium text-lg">
                {format(currentMonth, 'MMMM', { locale: ptBR })}
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="text-white/70 text-center w-full py-2 font-light"
              >
                {format(addMonths(currentMonth, 1), 'MMMM', { locale: ptBR })}
              </button>
            </SwiperSlide>
            <SwiperSlide>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 2))}
                className="text-white/70 text-center w-full py-2 font-light"
              >
                {format(addMonths(currentMonth, 2), 'MMMM', { locale: ptBR })}
              </button>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
      
      {/* Calendário com fundo branco */}
      <div className="bg-white rounded-b-2xl p-4 shadow-lg">
        {/* Dias da semana */}
        <div className="grid grid-cols-7 mb-2">
          {['d', 's', 't', 'q', 'q', 's', 's'].map((day, index) => (
            <div key={index} className="text-center text-xs text-indigo-300 font-normal">
              {day}
            </div>
          ))}
        </div>
        
        {/* Dias do mês */}
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
                onClick={() => onDateChange(dayInfo.date)}
                disabled={!dayInfo.isCurrentMonth}
              >
                <span>{dayInfo.date.getDate()}</span>
                
                {/* Bolinhas indicadoras de plantões */}
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
