import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export default function SearchableDropdown({ options, value, onChange, placeholder, icon: Icon, displayKey, valueKey, searchKeys }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value && !isOpen) {
      const match = options.find(o => o[valueKey] === value);
      if (match) setQuery(match[displayKey]);
      else setQuery(value);
    }
  }, [value, options]);

  const filtered = options.filter(o =>
    searchKeys.some(k => o[k]?.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSelect = (option) => {
    onChange(option[valueKey]);
    setQuery(option[displayKey]);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    onChange(e.target.value);
    setIsOpen(true);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-400 z-10" />}
        <input
          type="text"
          placeholder={placeholder}
          className={`input-field ${Icon ? 'pl-12' : 'pl-4'} pr-10`}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
        />
        <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-primary-400' : ''}`} />
      </div>
      
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-surface/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
          {filtered.map((option, idx) => (
            <button
              key={idx}
              type="button"
              className="w-full text-left px-5 py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0 flex flex-col group"
              onClick={() => handleSelect(option)}
            >
              <span className="font-medium text-slate-200 group-hover:text-white transition-colors">{option[displayKey]}</span>
              {option._subtitle && <span className="text-xs text-slate-500 mt-0.5 group-hover:text-slate-400 transition-colors">{option._subtitle}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
