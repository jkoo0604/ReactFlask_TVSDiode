import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import colors from '../config/colors';
import { FullscreenExit } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        backgroundColor: colors.backgroundAccordion,
        color: colors.textLabel,
        fontWeight: 600,
        fontSize: 24,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center'
    },    
}));

const MyHeader = ({title}) => {
    const classes = useStyles();

    return(
        <div className={classes.root}>
            {title}
        </div>
    );
}

export default MyHeader;