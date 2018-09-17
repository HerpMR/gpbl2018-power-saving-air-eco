import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import { subscribeToAirTemp, changeCurrentAirTemp } from './socket';

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
  },
});

class DialogSelect extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      temp: 20,
    };
    subscribeToAirTemp((err, temp) => this.setState((prevState) => {
      return {
        ...prevState,
        temp: temp
      }
    }));
  }


  handleChange = name => event => {
    this.setState({ [name]: Number(event.target.value) });
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = (isOk) => {
    if(isOk) {
      changeCurrentAirTemp(this.state.temp)
    }
    this.setState({ open: false });
  };

  handleChangeTemp(isInscrease) {
    let newTemp = 0 ;
    if(isInscrease) {
      this.state.temp < 30 && (newTemp = 1);
    }
    else {
      this.state.temp > 15 && (newTemp = -1);
    }

    console.log(newTemp)
    this.setState((prevState) => {
      return {
        ...prevState,
        temp: this.state.temp + newTemp
      }
    });
    changeCurrentAirTemp(newTemp)
  }
  

  render() {
    const { classes } = this.props;
    return (
      <div className="control-container">
        <span> Airconditioner Temperature</span>
        <div>
          <Button variant="contained" color="primary" onClick={() => this.handleChangeTemp(false)}> {`<`} </Button>
          <span> {this.state.temp} </span>
          <Button variant="contained" color="primary" onClick={()=>this.handleChangeTemp(true)}>{`>`}</Button>
        </div>
      </div>
    );
  }
}

DialogSelect.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DialogSelect);