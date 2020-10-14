import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import colors from '../config/colors';

const useStyles = makeStyles((theme) => ({
    button: {
        textTransform: 'uppercase',
        border: `1px solid ${colors.backgroundAccordion}`,
        height: 45,
        width: 130,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    left: {
        borderRadius: '50px 0px 0px 50px'
    },
    right: {
        borderRadius: '0px 50px 50px 0px'
    },
    active: {
        backgroundColor: colors.backgroundAccordion,
        color: colors.textLabel,
        fontWeight: 600
    },
    inactive: {
        background: 'transparent',
        colors: colors.textNormal
    },
    buttonText: {
        cursor: 'pointer'
    }
    
}));

const MyToggle = ({type, handleTypeChange, value, position}) => {
    const classes = useStyles();

    return(
        <div className={`${classes.button} ${position === 'left' ? classes.left : classes.right} ${type === '' ? (position === 'left' ? classes.active : classes.inactive) : (type === value ? classes.active : classes.inactive)}`} onClick={() => handleTypeChange(value)}>
            <span className={classes.buttonText}>{value}</span>
        </div>
    );
}

export default MyToggle;