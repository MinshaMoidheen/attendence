import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";


export type Column<T> = {
  header: string;
  accessor: keyof T;
  render?: (value: any, row: T) => React.ReactNode;
};

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
}

export default function BasicTableOne<T extends { id: string | number }>({
  columns,
  data,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={String(col.accessor)}
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          {/* Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {data.map((row) => (
              <TableRow key={row.id}>
                {columns.map((col) => (
                  <TableCell
                    key={String(col.accessor)}
                    className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    {col.render
                      ? col.render(row[col.accessor], row)
                      : (row[col.accessor] as React.ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}