import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'


// DnD
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable'

import Container from '../components/Container.tsx'
import Item from '../components/Item.tsx'
import { DNDType } from '../types/DNDType.ts'

export default function Home() {

  const [ containers, setContainers ] = useState<DNDType[]>([
    {
      id: `container-${uuidv4()}`,
      title: 'Container 1',
      items: [
        {
          id: `item-${uuidv4()}`,
          title: 'Item 1'
        }
      ]
    },
    {
      id: `container-${uuidv4()}`,
      title: 'Container 2',
      items: [
        {
          id: `item-${uuidv4()}`,
          title: 'Item 2'
        }
      ]
    }
  ])
  const [ activeId, setActiveId ] = useState<UniqueIdentifier | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const findValueOfItems = (id: UniqueIdentifier | undefined, type: string) => {
    if (type === 'container') {
      return containers.find((item) => item.id === id) // Finds a container by ID
    }
    if (type === 'item') {
      return containers.find((container) =>
        container.items.find((item) => item.id === id) // Finds an item by ID inside a container
      )
    }
  }

  const findItemTitle = (id: UniqueIdentifier | undefined) => {
    const container = findValueOfItems(id, 'item')
    if (!container) return ''
    const item = container.items.find((item) => item.id === id)
    if (!item) return ''
    return item.title
  }

  const findContainerTitle = (id: UniqueIdentifier | undefined) => {
    const container = findValueOfItems(id, 'container')
    if (!container) return ''
    return container.title
  }

  const findContainerItems = (id: UniqueIdentifier | undefined) => {
    const container = findValueOfItems(id, 'container')
    if (!container) return []
    return container.items
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const { id } = active
    setActiveId(id)
  }

  const moveItemInSameContainer = (activeContainerIndex: number, activeitemIndex: number, overitemIndex: number) => {
    const newItems = [ ...containers ]
    newItems[activeContainerIndex].items = arrayMove(
      newItems[activeContainerIndex].items,
      activeitemIndex,
      overitemIndex
    )
    setContainers(newItems)
  }

  const moveItemToDifferentContainer = (activeContainerIndex: number, activeitemIndex: number, overContainerIndex: number, overitemIndex: number) => {
    const newItems = [ ...containers ]
    const [ removedItem ] = newItems[activeContainerIndex].items.splice(activeitemIndex, 1)
    newItems[overContainerIndex].items.splice(overitemIndex, 0, removedItem)
    setContainers(newItems)
  }

  const moveContainer = (activeContainerIndex: number, overContainerIndex: number) => {
    let newItems = [ ...containers ]
    newItems = arrayMove(newItems, activeContainerIndex, overContainerIndex)
    setContainers(newItems)
  }

  const handleDragMove = (event: DragMoveEvent) => {
    const { active, over } = event

    if (!active || !over) return

    // Handle Item Sorting Within Same Container
    if (active.id.toString().includes('item') && over.id.toString().includes('item') && active.id !== over.id) {
      const activeContainer = findValueOfItems(active.id, 'item')
      const overContainer = findValueOfItems(over.id, 'item')

      if (activeContainer && overContainer) {
        const activeContainerIndex = containers.findIndex(c => c.id === activeContainer.id)
        const overContainerIndex = containers.findIndex(c => c.id === overContainer.id)

        const activeitemIndex = activeContainer.items.findIndex(item => item.id === active.id)
        const overitemIndex = overContainer.items.findIndex(item => item.id === over.id)

        if (activeContainerIndex === overContainerIndex) {
          moveItemInSameContainer(activeContainerIndex, activeitemIndex, overitemIndex)
        } else {
          moveItemToDifferentContainer(activeContainerIndex, activeitemIndex, overContainerIndex, overitemIndex)
        }
      }
    }

    // Handle Item Drop Into a Container
    if (active.id.toString().includes('item') && over.id.toString().includes('container') && active.id !== over.id) {
      const activeContainer = findValueOfItems(active.id, 'item')
      const overContainer = findValueOfItems(over.id, 'container')

      if (activeContainer && overContainer) {
        const activeContainerIndex = containers.findIndex(c => c.id === activeContainer.id)
        const overContainerIndex = containers.findIndex(c => c.id === overContainer.id)

        const activeitemIndex = activeContainer.items.findIndex(item => item.id === active.id)

        const newItems = [ ...containers ]
        const [ removedItem ] = newItems[activeContainerIndex].items.splice(activeitemIndex, 1)
        newItems[overContainerIndex].items.push(removedItem)
        setContainers(newItems)
      }
    }
  }


  // This is the function that handles the sorting of the containers and items when the user is done dragging.
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!active || !over) return

    // Handle Container Sorting
    if (active.id.toString().includes('container') && over.id.toString().includes('container') && active.id !== over.id) {
      const activeContainerIndex = containers.findIndex(c => c.id === active.id)
      const overContainerIndex = containers.findIndex(c => c.id === over.id)
      moveContainer(activeContainerIndex, overContainerIndex)
    }

    // Handle Item Sorting
    if (active.id.toString().includes('item') && over.id.toString().includes('item') && active.id !== over.id) {
      const activeContainer = findValueOfItems(active.id, 'item')
      const overContainer = findValueOfItems(over.id, 'item')

      if (activeContainer && overContainer) {
        const activeContainerIndex = containers.findIndex(c => c.id === activeContainer.id)
        const overContainerIndex = containers.findIndex(c => c.id === overContainer.id)

        const activeitemIndex = activeContainer.items.findIndex(item => item.id === active.id)
        const overitemIndex = overContainer.items.findIndex(item => item.id === over.id)

        if (activeContainerIndex === overContainerIndex) {
          moveItemInSameContainer(activeContainerIndex, activeitemIndex, overitemIndex)
        } else {
          moveItemToDifferentContainer(activeContainerIndex, activeitemIndex, overContainerIndex, overitemIndex)
        }
      }
    }

    // Handle Item Dropping Into Container
    if (active.id.toString().includes('item') && over.id.toString().includes('container') && active.id !== over.id) {
      const activeContainer = findValueOfItems(active.id, 'item')
      const overContainer = findValueOfItems(over.id, 'container')

      if (activeContainer && overContainer) {
        const activeContainerIndex = containers.findIndex(c => c.id === activeContainer.id)
        const overContainerIndex = containers.findIndex(c => c.id === overContainer.id)
        const activeitemIndex = activeContainer.items.findIndex(item => item.id === active.id)

        const newItems = [ ...containers ]
        const [ removedItem ] = newItems[activeContainerIndex].items.splice(activeitemIndex, 1)
        newItems[overContainerIndex].items.push(removedItem)
        setContainers(newItems)
      }
    }

    setActiveId(null)
  }



  return (
    <div className="mx-auto max-w-7xl py-10">
      <div className="flex items-center justify-between gap-y-2">
        <h1 className="text-gray-800 text-3xl font-bold">Dnd-kit Guide</h1>
      </div>
      <div className="mt-10">
        <div className="grid grid-cols-3 gap-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={containers.map((i) => i.id)}>
              {containers.map((container) => (
                <Container
                  id={container.id}
                  title={container.title}
                  key={container.id}
                >
                  <SortableContext items={container.items.map((i) => i.id)}>
                    <div className="flex items-start flex-col gap-y-4">
                      {container.items.map((i) => (
                        <Item title={i.title} id={i.id} key={i.id}/>
                      ))}
                    </div>
                  </SortableContext>
                </Container>
              ))}
            </SortableContext>
            <DragOverlay adjustScale={false}>
              {/* Drag Overlay For item Item */}
              {activeId && activeId.toString().includes('item') && (
                <Item id={activeId} title={findItemTitle(activeId)}/>
              )}
              {/* Drag Overlay For Container */}
              {activeId && activeId.toString().includes('container') && (
                <Container id={activeId} title={findContainerTitle(activeId)}>
                  {findContainerItems(activeId).map((i) => (
                    <Item key={i.id} title={i.title} id={i.id}/>
                  ))}
                </Container>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  )
}
