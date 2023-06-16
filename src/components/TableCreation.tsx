import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TablePagination from '@mui/material/TablePagination';
import { TableVirtuoso, TableComponents } from 'react-virtuoso';
import { TableSortLabel } from '@mui/material';
import colors from '../consts/colorPallete';
import { AllTableData } from '../consts/tableData';
import '../components/appMenuSections/miningPool/styles.css';
import { useAppSelector } from '../redux/store';
import { selectCurrentTheme } from '../redux/reducers/user-state';

const VirtuosoTableComponents: TableComponents<any /*don't know the type here*/> = {
  Scroller: React.forwardRef<HTMLDivElement>((props, ref) => <TableContainer component={Paper} {...props} ref={ref} />),
  Table: (props) => <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />,
  TableHead,
  TableRow: ({ item: _item, ...props }) => <TableRow {...props} />,
  TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => <TableBody {...props} ref={ref} />),
};

interface rowsProps {
  id: number;
  address: string;
}

interface columnsProps {
  width: number;
  label: string;
  dataKey: string;
}

interface TableCreationProps {
  rows: AllTableData[];
  rowContent: (index: number, row: AllTableData) => JSX.Element;
  columns: columnsProps[];
  tableId: string;
  customTableWidth: string;
}

const TableCreation = ({ rows, rowContent, columns, tableId, customTableWidth }: TableCreationProps) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(5);
  const [orderBy, setOrderBy] = React.useState<keyof AllTableData>();
  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  const totalRows = rows.length;

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [sortedColumn, setSortedColumn] = React.useState<keyof AllTableData>('id');

  const fixedHeaderContent = () => {
    return (
      <TableRow>
        {columns.map((column: columnsProps) => (
          <TableCell
            key={column.dataKey}
            variant="head"
            align={column.dataKey === 'address' ? 'left' : 'right'}
            style={{ width: column.width }}
            sx={{
              backgroundColor: colors[appCurrentTheme].primary,
              color: colors[appCurrentTheme].colorWriting,
            }}
          >
            <TableSortLabel
              sx={{
                ':hover': {
                  color: colors[appCurrentTheme].secondary,
                },
                ':focus': {
                  color: colors[appCurrentTheme].secondary,
                },
                ':active': {
                  color: colors[appCurrentTheme].secondary,
                },
              }}
              active={orderBy === column.dataKey}
              direction={orderBy === column.dataKey ? sortDirection : 'asc'}
              onClick={() => handleSortClick(column.dataKey as keyof AllTableData)}
            >
              {column.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    );
  };

  const handleSortClick = (column: keyof AllTableData) => {
    if (column === sortedColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortedColumn(column);
      setSortDirection('asc');
      setOrderBy(column);
    }
  };

  const sortedRows = React.useMemo(() => {
    const sortedRows = [...rows];
    sortedRows.sort((rowA, rowB) => {
      const valueA = rowA[sortedColumn];
      const valueB = rowB[sortedColumn];
      if (valueA !== undefined && valueB !== undefined) {
        if (sortDirection === 'asc') {
          return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        } else {
          return valueB < valueA ? -1 : valueB > valueA ? 1 : 0;
        }
      }
      return 0;
    });
    return sortedRows;
  }, [rows, sortedColumn, sortDirection]);

  const rowHeight =
    tableId === 'waiting' || tableId === 'miners' || tableId === 'notifier' || tableId === 'removals' ? 64.8 : 52.813;
  const headerHeight = 58;
  const tableHeight =
    rowsPerPage < totalRows
      ? (page + 1) * rowsPerPage < totalRows
        ? rowsPerPage * rowHeight + headerHeight
        : (totalRows - rowsPerPage * page) * rowHeight + headerHeight
      : totalRows * rowHeight + headerHeight;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        marginTop: 2,
        width: customTableWidth,
      }}
    >
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50, { label: 'All', value: totalRows }]}
        component="div"
        count={totalRows}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Rows per page:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors[appCurrentTheme].colorWriting,
        }}
      />
      <Paper style={{ height: tableHeight, width: '100%' }} elevation={6}>
        <TableVirtuoso
          data={sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
          components={VirtuosoTableComponents}
          fixedHeaderContent={fixedHeaderContent}
          itemContent={rowContent}
          style={{ backgroundColor: colors[appCurrentTheme].accent2 }}
        />
      </Paper>
    </Box>
  );
};

export default TableCreation;
