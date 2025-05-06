import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Pagination
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { TableLoading } from '../common/LoadingIndicator';

/**
 * A reusable data table component with consistent styling and built-in loading state
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Table title
 * @param {Array} props.columns - Array of column definitions with { id, label, align, minWidth, format }
 * @param {Array} props.data - Array of data rows
 * @param {boolean} props.loading - Whether the table is in loading state
 * @param {function} props.onRefresh - Function to call when refresh button is clicked
 * @param {function} props.onRowClick - Function to call when a row is clicked (row data as parameter)
 * @param {Object} props.emptyState - Configuration for empty state { message }
 * @param {Object} props.pagination - Pagination configuration { page, count, onChange }
 * @param {React.ReactNode} props.headerAction - Optional action button(s) to display in header instead of refresh
 */
const DataTable = ({
  title,
  columns,
  data = [],
  loading = false,
  onRefresh,
  onRowClick,
  emptyState = { message: 'No data found.' },
  pagination,
  headerAction
}) => {
  return (
    <Paper elevation={2} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
      {title && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{title}</Typography>
          {headerAction || (onRefresh && (
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
              disabled={loading}
            >
              Refresh
            </Button>
          ))}
        </Box>
      )}

      <TableContainer>
        <Table>
          <TableHead sx={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableLoading colSpan={columns.length} message="Loading data..." />
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    {emptyState.message}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  hover
                  key={row.id || index}
                  onClick={() => onRowClick && onRowClick(row)}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align || 'left'}>
                        {column.format ? column.format(value, row) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={pagination.count}
            page={pagination.page}
            onChange={pagination.onChange}
            color="primary"
            disabled={loading}
          />
        </Box>
      )}
    </Paper>
  );
};

export default DataTable;