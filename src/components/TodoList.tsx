import { useGlobalContext } from "~/GlobalContext/store"
import { Match, Show, Switch, batch } from "solid-js"
import Today from "~/pages/Today"
import Done from "~/pages/Done"
import All from "~/pages/All"
import Starred from "~/pages/Starred"
import ActionBar from "./ActionBar"
import LocalSearch from "./LocalSearch"
import { findIndexOfId } from "~/lib/lib"
import { createShortcut } from "@solid-primitives/keyboard"
import { createEventListener } from "@solid-primitives/event-listener"
import { createTodosForDev } from "~/lib/local"

export default function Page() {
  const global = useGlobalContext()

  let ref!: HTMLDivElement
  createEventListener(
    () => ref,
    "click",
    (e) => {
      if (e.target === ref) {
        global.setFocusedTodo("")
        global.setTodoToEdit("")
        global.setNewTodo(false)
      }
    },
    { passive: true }
  )

  createShortcut(
    ["Backspace"],
    () => {
      if (!global.localSearch() && !global.editingTodo()) {
        global.todosState.removeTodo(global.focusedTodo())

        let todoIdToFocus =
          global
            .orderedTodos()
            .findIndex((todo) => todo.id === global.focusedTodo()) + 1

        if (global.orderedTodos().length === todoIdToFocus) {
          global.setFocusedTodo(global.orderedTodos()[0].id)
        } else {
          global.setFocusedTodo(global.orderedTodos()[todoIdToFocus].id)
        }
        global.setCurrentlyFocusedTodo(
          findIndexOfId(global.orderedTodos(), global.focusedTodo()) - 1
        )
      }
    },
    { preventDefault: false }
  )

  createShortcut(
    ["N"],
    () => {
      if (global.newTodo()) return

      batch(() => {
        global.setFocusedTodo("")
        // TODO: change depending of where you create todo
        global.setNewTodoType("all")
        global.setNewTodo(true)
        global.setChangeFocus(false)
        global.setGuard(true)
      })
    },
    { preventDefault: false }
  )

  createShortcut(["Escape"], () => {
    if (!global.newTodo() && !global.localSearch() && !global.editingTodo())
      return

    batch(() => {
      global.setNewTodo(false)
      global.setLocalSearch(false)
      global.setChangeFocus(true)
      global.setEditingTodo(false)
    })
  })

  createShortcut(["ArrowDown"], () => {
    if (
      !global.changeFocus() ||
      global.orderedTodos().length === 0 ||
      global.editingTodo()
    )
      return

    if (global.localSearch() && global.localSearchResultIds().length > 0) {
      let index = global
        .localSearchResultIds()
        .findIndex((id) => id === global.localSearchResultId())
      if (index === global.localSearchResultIds().length - 1) {
        global.setLocalSearchResultId(global.localSearchResultIds()[0])
      } else {
        global.setLocalSearchResultId(global.localSearchResultIds()[index + 1])
      }
    } else {
      if (
        findIndexOfId(global.orderedTodos(), global.focusedTodo()) ===
        global.orderedTodos().length - 1
      ) {
        global.setFocusedTodo(global.orderedTodos()[0].id)
      } else {
        global.setFocusedTodo(
          global.orderedTodos()[
            findIndexOfId(global.orderedTodos(), global.focusedTodo()) + 1
          ].id
        )
      }
    }
  })

  createShortcut(["ArrowUp"], () => {
    if (
      !global.changeFocus() ||
      global.orderedTodos().length === 0 ||
      global.editingTodo()
    )
      return

    if (global.localSearch() && global.localSearchResultIds().length > 0) {
      let index = global
        .localSearchResultIds()
        .findIndex((id) => id === global.localSearchResultId())
      if (index === 0) {
        global.setLocalSearchResultId(
          global.localSearchResultIds()[
            global.localSearchResultIds().length - 1
          ]
        )
      } else {
        global.setLocalSearchResultId(global.localSearchResultIds()[index - 1])
      }
    } else {
      if (findIndexOfId(global.orderedTodos(), global.focusedTodo()) === 0) {
        global.setFocusedTodo(
          global.orderedTodos()[global.orderedTodos().length - 1].id
        )
      } else {
        if (global.focusedTodo() === "") {
          global.setFocusedTodo(
            global.orderedTodos()[global.orderedTodos().length - 1].id
          )
          return
        }

        global.setFocusedTodo(
          global.orderedTodos()[
            findIndexOfId(global.orderedTodos(), global.focusedTodo()) - 1
          ].id
        )
      }
    }
  })

  createShortcut(
    ["Enter"],
    () => {
      if (
        global.focusedTodo() !== "" &&
        !global.localSearch() &&
        !global.newTodo()
      ) {
        if (global.editingTodo()) {
          global.setEditingTodo(false)
          global.setEditNoteInTodo(false)
        } else {
          global.setEditingTodo(true)
        }
        global.setTodoToEdit(global.focusedTodo())
      }
    },
    { preventDefault: false }
  )

  createShortcut(
    ["O"],
    () => {
      if (global.newSubtask()) return

      batch(() => {
        global.setNewSubtask(true)
        // global.setFocusedTodo(0)
        // global.setNewTodoType("all")
        // global.setNewTodo(true)
        // global.setChangeFocus(false)
        // global.setGuard(true)
      })
    },
    { preventDefault: false }
  )

  createShortcut(
    ["T"],
    () => {
      if (
        global.focusedTodo() !== "" &&
        !global.localSearch() &&
        !global.newTodo() &&
        !global.editingTodo()
      ) {
        if (global.editingTodo()) {
          global.setEditingTodo(false)
        } else {
          global.setEditingTodo(true)
          global.setEditNoteInTodo(true)
        }
        global.setTodoToEdit(global.focusedTodo())
      }
    },
    { preventDefault: false }
  )

  createShortcut(
    ["F"],
    () => {
      if (global.editingTodo() || global.newTodo()) return

      batch(() => {
        global.setLocalSearch(true)
        global.setFocusedTodo("")
      })
    },
    { preventDefault: false }
  )

  // TODO: don't use in production, only for development
  createShortcut(
    ["Control", "I"],
    async () => {
      createTodosForDev()
    },
    { preventDefault: false }
  )

  for (const i of [0, 1, 2, 3] as const) {
    createShortcut(
      [`${i}`],
      () => {
        if (global.focusedTodo() !== "" && !global.editingTodo()) {
          global.todosState.updateTodo(global.focusedTodo(), (todo) => ({
            ...todo,
            priority: i,
          }))
        }
      },
      { preventDefault: false }
    )
  }

  createShortcut(
    ["4"],
    () => {
      if (global.focusedTodo() !== "" && !global.editingTodo()) {
        global.todosState.updateTodo(global.focusedTodo(), (todo) => ({
          ...todo,
          starred: !todo.starred,
        }))
      }
    },
    { preventDefault: false }
  )

  return (
    <div
      id="page"
      style={{
        "border-radius": "20px",
        height: "96vh",
      }}
      class="flex m-3 w-full rounded bg-white dark:bg-neutral-800 grow overflow-auto justify-between relative "
    >
      <style>
        {`

        ::-webkit-scrollbar {
          display: none
        }`}
      </style>
      <div
        class="flex flex-col m-3 mb-1 justify-between rounded overflow-auto relative w-full mt-6 drop"
        ref={ref}
      >
        <Switch>
          <Match when={global.activePage() === "All"}>
            <All />
          </Match>
          <Match when={global.activePage() === "Today"}>
            <Today />
          </Match>
          <Match when={global.activePage() === "Starred"}>
            <Starred />
          </Match>
          <Match when={global.activePage() === "Done"}>
            <Done />
          </Match>
        </Switch>
        <div
          style={{
            "border-radius": "20px",
          }}
          class="flex sticky bottom-2 right-0 p-1 dark:bg-stone-900 ml-3 mr-3 bg-gray-100"
        >
          <Show when={global.localSearch()} fallback={<ActionBar />}>
            <LocalSearch />
          </Show>
        </div>
      </div>
    </div>
  )
}
