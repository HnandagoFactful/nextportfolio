/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-spread */ 
/* eslint-disable @typescript-eslint/no-explicit-any */ 
import { useEffect, DependencyList } from 'react'

export function useDebounceEffect(
  fn: () => void,
  waitTime: number,
  deps?: DependencyList,
) {
  useEffect(() => {
    const t = setTimeout(() => {
      fn.apply(undefined, deps as any)
    }, waitTime)

    return () => {
      clearTimeout(t)
    }
  }, deps)
}