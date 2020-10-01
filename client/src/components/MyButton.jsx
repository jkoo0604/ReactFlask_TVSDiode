import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { SaveAltRounded } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
    button: {
        backgroundColor: props => `${props.bgColor}`,
        border: props => `1px solid ${props.borderColor}`,
        color: props => `${props.fontColor}`,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        fontSize: 14,
        borderRadius: 5,
        padding: '0px 30px',
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '45px',
        cursor: 'pointer'
    },    
}));

const MyButton = ({value, bgColor, borderColor, fontColor, handleSubmit, useIcon}) => {
    const classes = useStyles({bgColor, borderColor, fontColor});

    return(
        <div className={classes.button} onClick={handleSubmit}>
            {useIcon ? <SaveAltRounded /> : ''} {value}
        </div>
    );
}

export default MyButton;