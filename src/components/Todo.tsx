import clsx from "clsx"
import { Accessor, Setter, Show, createSignal } from "solid-js"
import { TodoType, useGlobalContext } from "../GlobalContext/store"
import Icon from "./Icon"
import TodoEdit from "./TodoEdit"
import { isToday } from "~/lib/lib"

interface Props {
  todo: TodoType
}

export default function Todo(props: Props) {
  const global = useGlobalContext()
  const [triggerAnimation, setTriggerAnimation] = createSignal(false)

  return (
    <>
      <style>
        {`
        .animated {
          animation: pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}
      </style>
      <Show
        when={global.todoToEdit() !== props.todo.id}
        fallback={<TodoEdit todo={props.todo} />}
      >
        <div
          class={clsx(
            "flex cursor-default pl-1.5 justify-between p-1 dark:border-neutral-700",
            props.todo.note && "min-h-min",
            props.todo.id === global.focusedTodo() &&
              "dark:bg-neutral-700 bg-zinc-200 rounded",
            global.localSearchResultIds().includes(props.todo.id) &&
              "border rounded border-blue-500",
            global.localSearchResultId() === props.todo.id && "bg-red-200"
          )}
          style={{
            "border-bottom-width": "1px",
            "-webkit-user-select": "none",
            "user-select": "none",
          }}
          onClick={(e) => {
            if (e.timeStamp - global.clickTimeStamp() > 200) {
              global.setClickTimeStamp(0)
            }

            if (global.clickTimeStamp() === 0) {
              global.setClickTimeStamp(e.timeStamp)
            } else {
              if (e.timeStamp - global.clickTimeStamp() < 200) {
                global.setEditingTodo(true)
                global.setTodoToEdit(props.todo.id)
                return
              }
            }

            if (props.todo.id !== global.focusedTodo()) {
              let array = global.orderedTodos()
              global.setEditingTodo(false)
              global.setFocusedTodo(props.todo.id)

              global.setCurrentlyFocusedTodo(
                array.findIndex((i) => i.id === props.todo.id)
              )
            }
          }}
        >
          <div
            style={{ display: "flex", "align-items": "center", gap: "8px" }}
            class={triggerAnimation() ? "animated" : ""}
          >
            <div
              onClick={() => {
                setTriggerAnimation(true)
                setTimeout(() => {
                  global.setTodos(
                    global.todos().map((t) => {
                      if (t.title === props.todo.title) {
                        return { ...t, done: !t.done }
                      }
                      return t
                    })
                  )
                  setTriggerAnimation(false)
                }, 300)
              }}
            >
              <Icon name={props.todo.done ? "SquareCheck" : "Square"} />
            </div>
            <div>
              <div>{props.todo.title}</div>
              <div class="opacity-60 text-sm ">{props.todo.note}</div>
            </div>
          </div>
          <div
            style={{ "padding-right": "0.375rem" }}
            class="flex gap-3 items-center"
          >
            <div class="opacity-50 " style={{ "font-size": "14.8px" }}>
              {props.todo?.dueDate && isToday(props.todo.dueDate)
                ? "Today"
                : ""}
            </div>
            <Show when={!props.todo.starred}>
              <div>
                {props.todo.priority === 3 && <Icon name={"Priority 3"} />}
                {props.todo.priority === 2 && <Icon name={"Priority 2"} />}
                {props.todo.priority === 1 && <Icon name={"Priority 1"} />}
              </div>
            </Show>
            <Show when={props.todo.starred}>
              <div>
                {props.todo.priority === 3 && (
                  <Icon name={"StarWithPriority3"} />
                )}
                {props.todo.priority === 2 && (
                  <Icon name={"StarWithPriority2"} />
                )}
                {props.todo.priority === 1 && (
                  <Icon name={"StarWithPriority1"} />
                )}
                {props.todo.priority === 0 && <Icon name={"Star"} />}
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </>
  )
}
