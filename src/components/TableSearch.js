import React from 'react';
import Grow from '@material-ui/core/Grow';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import { withStyles } from '@material-ui/core/styles';

const defaultSearchStyles = theme => ({
  main: {
    display: 'flex',
    flex: '1 0 auto',
  },
  searchIcon: {
    color: theme.palette.text.secondary,
    marginTop: '10px',
    marginRight: '0',
  },
  searchText: {
    flex: '1 0',
  },
  clearIcon: {
    '&:hover': {
      color: theme.palette.error.main,
    },
  },
});

class TableSearch extends React.Component {
  handleTextChange = event => {
    this.props.onSearch(event.target.value);
  };

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown, false);
  }

  onKeyDown = event => {
    if (event.keyCode === 27 || event.keyCode === 13) {
      // this.props.onHide();
      this.props.onClickSearch(this.props.searchText);
    }
  };

  render() {
    const { classes, options, onHide, searchText, onClickSearch, buttonSearch } = this.props;

    return (
      <Grow appear in={true} timeout={300}>
        {buttonSearch ? (
          <div className={classes.main} ref={el => (this.rootRef = el)}>
            <IconButton className={classes.clearIcon} onClick={onHide}>
              <ClearIcon />
            </IconButton>
            <TextField
              className={classes.searchText}
              style={{ marginTop: 7 }}
              autoFocus={true}
              InputProps={{
                'data-test-id': options.textLabels.toolbar.search,
                'aria-label': options.textLabels.toolbar.search,
              }}
              value={searchText || ''}
              onChange={this.handleTextChange}
              fullWidth={true}
              inputRef={el => (this.searchField = el)}
              placeholder={options.searchPlaceholder ? options.searchPlaceholder : 'Search ..'}
            />
            <IconButton onClick={() => onClickSearch(searchText)}>
              <SearchIcon />
            </IconButton>
          </div>
        ) : (
          <div className={classes.main} ref={el => (this.rootRef = el)}>
            {/* <SearchIcon style={{ marginRight: '10px' }} className={classes.searchIcon} /> */}
            <TextField
              className={classes.searchText}
              style={{ marginTop: 7 }}
              autoFocus={true}
              InputProps={{
                'data-test-id': options.textLabels.toolbar.search,
                'aria-label': options.textLabels.toolbar.search,
              }}
              value={searchText || ''}
              onChange={this.handleTextChange}
              fullWidth={true}
              inputRef={el => (this.searchField = el)}
              placeholder={options.searchPlaceholder ? options.searchPlaceholder : 'Search ..'}
            />
            <IconButton className={classes.clearIcon} onClick={onHide}>
              <ClearIcon />
            </IconButton>
          </div>
        )}
      </Grow>
    );
  }
}

export default withStyles(defaultSearchStyles, { name: 'MUIDataTableSearch' })(TableSearch);
