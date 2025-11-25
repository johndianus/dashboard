import React, { useState, useEffect, useRef } from 'react'
import { CFormInput, CListGroup, CListGroupItem } from '@coreui/react'

function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  style = {},
  inputSize = 'sm',
}) {
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState(options)
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    setFiltered(options.filter((c) => c.label.toLowerCase().includes(search.toLowerCase())))
    setHighlightedIndex(-1)
  }, [search, options])

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  function handleKeyDown(e) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true)
      setHighlightedIndex(0)
      return
    }

    if (!open) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : prev))
      scrollToHighlighted()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0))
      scrollToHighlighted()
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault()
      const selected = filtered[highlightedIndex]
      if (selected) {
        onSelectOption(selected)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  function scrollToHighlighted() {
    if (!listRef.current) return
    const listElement = listRef.current
    const itemElement = listElement.children[highlightedIndex]
    if (itemElement) {
      const listRect = listElement.getBoundingClientRect()
      const itemRect = itemElement.getBoundingClientRect()
      if (itemRect.bottom > listRect.bottom) {
        itemElement.scrollIntoView(false)
      } else if (itemRect.top < listRect.top) {
        itemElement.scrollIntoView()
      }
    }
  }

  function onSelectOption(option) {
    onChange(option.value)
    setSearch(option.label)
    setOpen(false)
    if (inputRef.current) inputRef.current.blur()
  }

  // Keep search label in sync with selected value on mount or value change
  useEffect(() => {
    const selectedOption = options.find((o) => o.value === value)
    if (selectedOption) {
      setSearch(selectedOption.label)
    } else {
      setSearch('')
    }
  }, [value, options])

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        ...style,
        maxWidth: '100%',
        overflow: 'visible',
        minWidth: '200px',
      }}
    >
      <CFormInput
        size={inputSize}
        placeholder={placeholder}
        value={search}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setSearch(e.target.value)
          setOpen(true)
        }}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        ref={inputRef}
        style={{ height: '36px', padding: '8px 12px', fontSize: '16px' }} // adjust height & padding as needed
      />
      {open && (
        <CListGroup
          ref={listRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)', // slightly below input
            zIndex: 1100,
            width: '100%',
            maxHeight: '360px',
            overflowY: 'auto',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06)',
            backgroundColor: 'white',
            borderRadius: '4px',
            border: '1px solid #ddd',
          }}
        >
          {filtered.length ? (
            filtered.map((c, i) => (
              <CListGroupItem
                key={c.value}
                active={c.value === value}
                onClick={() => onSelectOption(c)}
                onMouseEnter={() => setHighlightedIndex(i)}
                className="text-truncate"
                style={{
                  padding: '6px 10px',
                  lineHeight: '1.3',
                  display: 'block',
                  height: 'auto',
                  whiteSpace: 'normal',
                  backgroundColor: highlightedIndex === i ? '#f0f0f0' : '',
                  color: highlightedIndex === i ? '#000' : '',
                }}
              >
                {c.label}
              </CListGroupItem>
            ))
          ) : (
            <CListGroupItem disabled>No results</CListGroupItem>
          )}
        </CListGroup>
      )}
    </div>
  )
}

export default SearchableSelect
