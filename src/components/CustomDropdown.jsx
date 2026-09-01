import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomDropdown({
  options = [],
  value,
  onChange,
  className = '',
  buttonClassName = '',
  placeholder = '请选择',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left w-full ${className}`}>
      {/* 触发按键 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-900 text-xs font-medium transition-all shadow-xs focus:outline-none focus:border-stone-900 ${buttonClassName}`}
      >
        <span className="truncate flex items-center gap-1.5">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-stone-900' : ''
          }`}
        />
      </button>

      {/* 定制悬浮菜单 (强制最高层级 z-[100] 与 100% 不透明纯白底色，彻底杜绝被下层卡片遮挡或透底) */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-[100] mt-1.5 origin-top-right rounded-xl bg-white border border-stone-300 shadow-2xl py-1.5 text-xs text-stone-800 animate-studio-in max-h-64 overflow-y-auto custom-scrollbar ring-1 ring-black/5">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors ${
                  isSelected
                    ? 'bg-stone-100 text-stone-900 font-bold'
                    : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-stone-900 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
