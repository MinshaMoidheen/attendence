"use client";

import { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { useGetAllTasksQuery, useUpdateTaskMutation } from "@/store/taskApiSlice";
import {
  KanbanProvider,
  KanbanBoard,
  KanbanHeader,
  KanbanCards,
  KanbanCard,
  type DragEndEvent,
} from "@/components/ui/shadcn-io/kanban";
import Badge from "@/components/ui/badge/Badge";
import { CalendarIcon, UserIcon, ClockIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

interface Task {
  _id: string;
  fromUserId: string | { _id: string; email: string };
  toUserId: string | { _id: string; email: string };
  description: string;
  shortDesc: string;
  timeAndDate: string;
  tracking: {
    status: 'planned' | 'inprogress' | 'completed';
    date: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface KanbanTask {
  id: string;
  _id: string;
  fromUserId: string | { _id: string; email: string };
  toUserId: string | { _id: string; email: string };
  description: string;
  shortDesc: string;
  timeAndDate: string;
  tracking: {
    status: 'planned' | 'inprogress' | 'completed';
    date: string;
  }[];
  createdAt: string;
  updatedAt: string;
  name: string;
  column: string;
  [key: string]: any; // Add index signature for KanbanItemProps compatibility
}

const columns = [
  { id: 'planned', name: 'Planned' },
  { id: 'inprogress', name: 'In Progress' },
  { id: 'completed', name: 'Completed' },
];

export default function TasksKanban() {
  const [kanbanData, setKanbanData] = useState<KanbanTask[]>([]);
  
  const { 
    data: apiResponse, 
    isLoading, 
    error, 
    refetch 
  } = useGetAllTasksQuery({ 
    page: 1, 
    limit: 50
  });

  const [updateTask] = useUpdateTaskMutation();

  // Transform tasks data for Kanban
  useEffect(() => {
    if (apiResponse?.tasks) {
      const transformedTasks: KanbanTask[] = apiResponse.tasks.map((task: Task) => {
        // Get the latest status from tracking array
        const latestStatus = task.tracking && task.tracking.length > 0 
          ? task.tracking[task.tracking.length - 1].status 
          : 'planned';
        
        console.log(`Task ${task._id}:`, {
          tracking: task.tracking,
          latestStatus: latestStatus,
          shortDesc: task.shortDesc
        });
        
        return {
          ...task,
          id: task._id,
          name: task.shortDesc,
          column: latestStatus,
        };
      });
      setKanbanData(transformedTasks);
    }
  }, [apiResponse]);

  const handleDragEnd = async (event: DragEndEvent) => {
    console.log("inside drag")
    console.log("event", event)
    const { active, over, collisions } = event;

    console.log("active, over", active, over)
    console.log("collisions", collisions)
    
    if (!over) {
      console.log("No valid drop target")
      return;
    }

    const activeTask = kanbanData.find((task) => task.id === active.id);
    
    // Check if over.id is a column ID (not a task ID)
    let newColumn = columns.find((column) => column.id === over.id)?.id;
    
    // If over.id is not a column, it might be a task in a different column
    // In that case, we need to find which column the over task belongs to
    if (!newColumn) {
      const overTask = kanbanData.find((task) => task.id === over.id);
      if (overTask) {
        newColumn = overTask.column;
        console.log("Found column from overTask:", newColumn)
      } else {
        // Check collisions to find the column
        const columnCollision = collisions?.find(collision => 
          columns.some(col => col.id === collision.id)
        );
        if (columnCollision) {
          newColumn = columnCollision.id as string;
          console.log("Found column from collision:", newColumn)
        }
      }
    } else {
      console.log("Found column directly:", newColumn)
    }

    // If we still don't have a newColumn, try to find it from the active task's current position
    if (!newColumn) {
      console.log("Could not determine new column, using active task's current column")
      return;
    }

    console.log("activeTask", activeTask)
    console.log("activeTask.column", activeTask?.column)
    console.log("newColumn", newColumn)

    if (!activeTask || !newColumn) {
      console.log("Missing activeTask or newColumn")
      return;
    }

    // if (activeTask.column === newColumn) {
    //   console.log(`Task is already in the same column (${activeTask.column}), no update needed`)
    //   return;
    // }

    console.log(`Moving task from ${activeTask.column} to ${newColumn}`)

    // Update local state immediately for better UX
    const updatedTasks = kanbanData.map((task) =>
      task.id === active.id ? { ...task, column: newColumn } : task
    );
    setKanbanData(updatedTasks);

    try {
      // Create new tracking entry with current status and date
      const newTrackingEntry = {
        status: newColumn as 'planned' | 'inprogress' | 'completed',
        date: new Date().toISOString(), // Send as ISO string for JSON serialization
      };

      console.log("newTrackingEntry", newTrackingEntry)
      console.log("Current tracking array:", activeTask.tracking)
      console.log("Updated tracking array:", [...(activeTask.tracking || []), newTrackingEntry])

      console.log("Making API call to update task...")
      
      // Update task with new tracking entry
      const result = await updateTask({
        taskId: active.id as string,
        tracking: [...(activeTask.tracking || []), newTrackingEntry],
      }).unwrap();
      
      console.log("API call successful:", result)
      console.log(`Task ${active.id} moved to ${newColumn} with tracking updated`);
    } catch (error) {
      console.error("Error updating task:", error);
      // Revert local state on error
      setKanbanData(kanbanData);
      alert("Failed to update task status. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inprogress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserEmail = (user: string | { _id: string; email: string }) => {
    return typeof user === 'string' ? user : user.email;
  };

  if (isLoading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Tasks Kanban" />
        <div className="space-y-6">
          <ComponentCard title="Tasks Kanban Board">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading tasks...</span>
            </div>
          </ComponentCard>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Tasks Kanban" />
        <div className="space-y-6">
          <ComponentCard title="Tasks Kanban Board">
            <Alert
              variant="error"
              title="Error"
              message="Failed to load tasks. Please try again."
            />
            <div className="mt-4">
              <Button
                onClick={() => refetch()}
                variant="primary"
                size="sm"
              >
                Retry
              </Button>
            </div>
          </ComponentCard>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Tasks Kanban" />
      <div className="space-y-6">
        <ComponentCard title="Tasks Kanban Board">
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Drag and drop tasks between columns to update their status
              </div>
              <div className="flex gap-2">
                <Link href="/tasks/add">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add Task
                  </Button>
                </Link>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  size="sm"
                >
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          <div className="h-[600px] w-full">
            <KanbanProvider
              columns={columns}
              data={kanbanData}
              onDataChange={(data) => setKanbanData(data as any)}
              onDragEnd={handleDragEnd}
              onDragOver={(event) => {
                console.log("onDragOver", event);
                // This helps with detecting column drops
              }}
            >
              {(column) => (
                <KanbanBoard key={column.id} id={column.id} className="h-full">
                  <KanbanHeader className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                      <Badge 
                        color={column.id === 'planned' ? 'warning' : column.id === 'inprogress' ? 'info' : 'success'}
                        variant="light"
                      >
                        {column.name}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {kanbanData.filter(task => task.column === column.id).length} tasks
                      </span>
                    </div>
                  </KanbanHeader>
                  <KanbanCards id={column.id}>
                    {(task: any) => (
                      <KanbanCard
                        key={task.id}
                        id={task.id}
                        name={task.name}
                        column={task.column}
                        className="hover:shadow-md transition-shadow"
                      >
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                              {task.shortDesc}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{formatDate(task.timeAndDate)}</span>
                            <span>•</span>
                            <span>{formatTime(task.timeAndDate)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <UserIcon className="h-3 w-3" />
                            <span>From: {getUserEmail(task.fromUserId)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <UserIcon className="h-3 w-3" />
                            <span>To: {getUserEmail(task.toUserId)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <ClockIcon className="h-3 w-3" />
                            <span>Created: {formatDate(task.createdAt)}</span>
                          </div>
                          
                          {task.tracking && task.tracking.length > 0 && (
                            <div className="pt-2 border-t">
                              <div className="text-xs text-gray-500">
                                Last updated: {formatDate(task.tracking[task.tracking.length - 1].date)}
                              </div>
                            </div>
                          )}
                        </div>
                      </KanbanCard>
                    )}
                  </KanbanCards>
                </KanbanBoard>
              )}
            </KanbanProvider>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
