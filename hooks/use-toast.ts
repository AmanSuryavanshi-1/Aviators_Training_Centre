import * as React from "react"

import { ToastAction } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactElement<typeof ToastAction>
  duration?: number
}

type Toast = Omit<ToasterToast, "id">

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return `toast-${count}`
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

type ActionType = typeof actionTypes