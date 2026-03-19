import React from 'react';
import { Table, TableHead, TableRow, TableCell } from '../ui/table';

type AuditRow = {
  id: string;
  name: string;
  createdAt: string;
  status: string;
};

const mockAudits: AuditRow[] = [
  {
    id: '1',
    name: 'Demo audit #1',
    createdAt: '2026-03-18 10:00',
    status: 'Completed',
  },
];

export const AuditsTable: React.FC = () => (
  <Table>
    <thead>
      <TableRow>
        <TableHead>ID</TableHead>
        <TableHead>Name</TableHead>
        <TableHead>Created at</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </thead>
    <tbody>
      {mockAudits.map((audit) => (
        <TableRow key={audit.id}>
          <TableCell>{audit.id}</TableCell>
          <TableCell>{audit.name}</TableCell>
          <TableCell>{audit.createdAt}</TableCell>
          <TableCell>{audit.status}</TableCell>
        </TableRow>
      ))}
    </tbody>
  </Table>
);

