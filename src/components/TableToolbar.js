import React from 'react';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Popover from './Popover';
import TableFilter from './TableFilter';
import TableViewCol from './TableViewCol';
import TableSearch from './TableSearch';
import SearchIcon from '@material-ui/icons/Search';
import CircularProgress from '@material-ui/core/CircularProgress';
// import LinearProgress from '@material-ui/core/LinearProgress';

// BorderLinearProgress
import DownloadIcon from '@material-ui/icons/CloudDownload';
import PrintIcon from '@material-ui/icons/Print';
import UploadIcon from '@material-ui/icons/CloudUpload';
import AddIcon from '@material-ui/icons/Add';
import ViewColumnIcon from '@material-ui/icons/ViewColumn';
import FilterIcon from '@material-ui/icons/FilterList';
import ReactToPrint from 'react-to-print';
import { withStyles } from '@material-ui/core/styles';
import { createCSVDownload } from '../utils';

export const defaultToolbarStyles = theme => ({
  root: {},
  left: {
    flex: '1 1 auto',
  },
  actions: {
    flex: '1 1 auto',
    textAlign: 'right',
  },
  titleRoot: {},
  titleText: {},
  subtitleText: {},
  icon: {
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  iconActive: {
    color: theme.palette.primary.main,
  },
  filterPaper: {
    maxWidth: '50%',
  },
  searchIcon: {
    display: 'inline-flex',
    marginTop: '10px',
    marginRight: '8px',
  },
  [theme.breakpoints.down('sm')]: {
    titleRoot: {},
    titleText: {
      fontSize: '16px',
      fontWeight: '600',
    },
    subtitleText: {
      fontSize: '13px',
      fontWeight: '300',
    },
    spacer: {
      display: 'none',
    },
    left: {
      // flex: "1 1 40%",
      pcreateing: '8px 0px',
    },
    actions: {
      // flex: "1 1 60%",
      textAlign: 'right',
    },
  },
  [theme.breakpoints.down('xs')]: {
    root: {
      display: 'block',
    },
    left: {
      pcreateing: '8px 0px 0px 0px',
    },
    titleText: {
      textAlign: 'center',
    },
    subtitleText: {
      textAlign: 'center',
    },
    actions: {
      textAlign: 'center',
    },
  },
  '@media screen and (max-width: 480px)': {},
});

const ColorCircularProgress = withStyles({
  root: {
    color: '#2B9133',
  },
})(CircularProgress);

class TableToolbar extends React.Component {
  state = {
    iconActive: null,
    showSearch: Boolean(this.props.searchText || this.props.options.searchText || this.props.options.searchOpen),
    searchText: this.props.searchText || null,
    searchPosition: 120,
  };

  componentDidUpdate(prevProps) {
    if (this.props.searchText !== prevProps.searchText) {
      this.setState({ searchText: this.props.searchText });
    }
  }

  handleUpload = () => {
    this.props.onUpload();
  };

  handleCreate = () => {
    this.props.onCreate();
  };

  handlePrint = () => {
    this.props.onPrint();
  };

  handleDownload = () => {
    this.props.onDownload();
  };

  handleCSVDownload = () => {
    const { data, displayData, columns, options } = this.props;
    let dataToDownload = data;
    let columnsToDownload = columns;

    if (options.downloadOptions && options.downloadOptions.filterOptions) {
      // check rows first:
      if (options.downloadOptions.filterOptions.useDisplayedRowsOnly) {
        dataToDownload = displayData.map((row, index) => {
          let i = -1;

          // Help to preserve sort order in custom render columns
          row.index = index;

          return {
            data: row.data.map(column => {
              i += 1;

              // if we have a custom render, which will appear as a react element, we must grab the actual value from data
              // TODO: Create a utility function for checking whether or not something is a react object
              return typeof column === 'object' && column !== null && !Array.isArray(column)
                ? data[row.index].data[i]
                : column;
            }),
          };
        });
      }

      // now, check columns:
      if (options.downloadOptions.filterOptions.useDisplayedColumnsOnly) {
        columnsToDownload = columns.filter((_, index) => _.display === 'true');

        dataToDownload = dataToDownload.map(row => {
          row.data = row.data.filter((_, index) => columns[index].display === 'true');
          return row;
        });
      }
    }
    createCSVDownload(columnsToDownload, dataToDownload, options);
  };

  setActiveIcon = iconName => {
    this.setState(
      prevState => ({
        showSearch: this.isSearchShown(iconName),
        iconActive: iconName,
        prevIconActive: prevState.iconActive,
      }),
      () => {
        const { iconActive, prevIconActive } = this.state;

        if (iconActive === 'filter') {
          this.props.setTableAction('onFilterDialogOpen');
          if (this.props.options.onFilterDialogOpen) {
            this.props.options.onFilterDialogOpen();
          }
        }
        if (iconActive === undefined && prevIconActive === 'filter') {
          this.props.setTableAction('onFilterDialogClose');
          if (this.props.options.onFilterDialogClose) {
            this.props.options.onFilterDialogClose();
          }
        }
      },
    );
  };

  isSearchShown = iconName => {
    let nextVal = false;
    if (this.state.showSearch) {
      if (this.state.searchText) {
        nextVal = true;
      } else {
        const { onSearchClose } = this.props.options;
        this.props.setTableAction('onSearchClose');
        if (onSearchClose) onSearchClose();
        nextVal = false;
      }
    } else if (iconName === 'search') {
      nextVal = this.showSearch();
    }
    return nextVal;
  };

  getActiveIcon = (styles, iconName) => {
    return this.state.iconActive !== iconName ? styles.icon : styles.iconActive;
  };

  showSearch = () => {
    this.props.setTableAction('onSearchOpen');
    !!this.props.options.onSearchOpen && this.props.options.onSearchOpen();
    return true;
  };

  hideSearch = () => {
    const { onSearchClose } = this.props.options;

    this.props.setTableAction('onSearchClose');
    if (onSearchClose) onSearchClose();
    this.props.searchTextUpdate(null);

    this.setState(() => ({
      iconActive: null,
      showSearch: false,
      searchText: null,
    }));

    this.searchButton.focus();
  };

  handleSearch = value => {
    this.setState({ searchText: value });
    !this.props.buttonSearch && this.props.searchTextUpdate(value);
  };

  handleClickSearch = value => {
    this.props.onSearch && this.props.onSearch(value);
    this.props.buttonReactiveSearch && this.props.searchTextUpdate(value);
  };

  render() {
    const {
      data,
      options,
      classes,
      columns,
      filterData,
      filterList,
      filterUpdate,
      resetFilters,
      toggleViewColumn,
      title,
      subtitle,
      tableRef,
      enableOnEnterReactiveSearch,
      buttonSearch,
      circularProgress,
    } = this.props;

    const {
      search,
      print,
      download,
      downloadCsv,
      create,
      upload,
      viewColumns,
      filterTable,
    } = options.textLabels.toolbar;
    const { showSearch, searchText } = this.state;
    var searchPosition = 120;

    return (
      <Toolbar className={classes.root} role={'toolbar'} aria-label={'Table Toolbar'}>
        <div className={classes.left}>
          {showSearch === true ? (
            options.customSearchRender ? (
              options.customSearchRender(searchText, this.handleSearch, this.hideSearch, options)
            ) : (
              <div>
                <div style={{ display: 'none' }}>
                  {options.download && (searchPosition += 48)}
                  {options.print && (searchPosition += 48)}
                  {!options.filter && (searchPosition -= 48)}
                  {this.props.buttonDownload && (searchPosition += 48)}
                  {this.props.buttonPrint && (searchPosition += 48)}
                  {this.props.buttonUpload && (searchPosition += 48)}
                  {this.props.buttonCreate && (searchPosition += 48)}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: '7.5px',
                    maxWidth: '300px',
                    right: searchPosition.toString() + 'px',
                    backgroundColor: '#fff',
                    zIndex: '2',
                  }}>
                  <TableSearch
                    enableOnEnterReactiveSearch={enableOnEnterReactiveSearch}
                    buttonSearch={buttonSearch}
                    onClickSearch={data => this.handleClickSearch(data)}
                    searchText={searchText}
                    onSearch={this.handleSearch}
                    onHide={this.hideSearch}
                    options={options}
                  />
                </div>
              </div>
            )
          ) : (
            <div />
          )}
          <div className={classes.titleRoot} aria-hidden={'true'}>
            <Typography variant="h6" className={classes.titleText}>
              {title}
            </Typography>
            {subtitle && (
              <Typography className={classes.subtitleText} style={{ color: 'rgba(0, 0, 0, 0.54)', fontSize: '13px' }}>
                {subtitle}
              </Typography>
            )}
          </div>
        </div>

        {circularProgress && <ColorCircularProgress size={24} />}

        <div className={classes.actions}>
          {options.search && (
            <Tooltip title={search} disableFocusListener>
              <IconButton
                aria-label={search}
                data-testid={search + '-iconButton'}
                buttonRef={el => (this.searchButton = el)}
                classes={{ root: this.getActiveIcon(classes, 'search') }}
                onClick={this.setActiveIcon.bind(null, 'search')}>
                <SearchIcon />
              </IconButton>
            </Tooltip>
          )}

          {options.viewColumns && (
            <Popover
              refExit={this.setActiveIcon.bind(null)}
              trigger={
                <Tooltip title={viewColumns} disableFocusListener>
                  <IconButton
                    data-testid={viewColumns + '-iconButton'}
                    aria-label={viewColumns}
                    classes={{ root: this.getActiveIcon(classes, 'viewcolumns') }}
                    onClick={this.setActiveIcon.bind(null, 'viewcolumns')}>
                    <ViewColumnIcon />
                  </IconButton>
                </Tooltip>
              }
              content={
                <TableViewCol data={data} columns={columns} options={options} onColumnUpdate={toggleViewColumn} />
              }
            />
          )}

          {options.filter && (
            <Popover
              refExit={this.setActiveIcon.bind(null)}
              classes={{ paper: classes.filterPaper }}
              trigger={
                <Tooltip title={filterTable} disableFocusListener>
                  <IconButton
                    data-testid={filterTable + '-iconButton'}
                    aria-label={filterTable}
                    classes={{ root: this.getActiveIcon(classes, 'filter') }}
                    onClick={this.setActiveIcon.bind(null, 'filter')}>
                    <FilterIcon />
                  </IconButton>
                </Tooltip>
              }
              content={
                <TableFilter
                  customFooter={options.customFilterDialogFooter}
                  columns={columns}
                  options={options}
                  filterList={filterList}
                  filterData={filterData}
                  onFilterUpdate={filterUpdate}
                  onFilterReset={resetFilters}
                />
              }
            />
          )}

          {options.download && (
            <Tooltip title={downloadCsv}>
              <IconButton
                data-testid={downloadCsv + '-iconButton'}
                aria-label={downloadCsv}
                classes={{ root: classes.icon }}
                onClick={this.handleCSVDownload}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          )}

          {options.print && (
            <span>
              <ReactToPrint
                trigger={() => (
                  <span>
                    <Tooltip title={print}>
                      <IconButton
                        data-testid={print + '-iconButton'}
                        aria-label={print}
                        classes={{ root: classes.icon }}>
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                  </span>
                )}
                content={() => this.props.tableRef()}
              />
            </span>
          )}

          {this.props.buttonPrint && (
            <span>
              <Tooltip title={print}>
                <IconButton
                  data-testid={print + '-iconButton'}
                  aria-label={print}
                  classes={{ root: classes.icon }}
                  onClick={this.handlePrint}>
                  <PrintIcon />
                </IconButton>
              </Tooltip>
            </span>
          )}

          {this.props.buttonUpload && (
            <span>
              <Tooltip title={upload}>
                <IconButton
                  data-testid={upload + '-iconButton'}
                  aria-label={upload}
                  classes={{ root: classes.icon }}
                  onClick={this.handleUpload}>
                  <UploadIcon />
                </IconButton>
              </Tooltip>
            </span>
          )}

          {this.props.buttonDownload && (
            <span>
              <Tooltip title={download}>
                <IconButton
                  data-testid={download + '-iconButton'}
                  aria-label={download}
                  classes={{ root: classes.icon }}
                  onClick={this.handleDownload}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </span>
          )}

          {this.props.buttonCreate && (
            <span>
              <Tooltip title={create}>
                <IconButton
                  data-testid={create + '-iconButton'}
                  aria-label={create}
                  classes={{ root: classes.icon }}
                  onClick={this.handleCreate}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </span>
          )}
          {options.customToolbar && options.customToolbar()}
        </div>
      </Toolbar>
    );
  }
}

export default withStyles(defaultToolbarStyles, { name: 'MUIDataTableToolbar' })(TableToolbar);
