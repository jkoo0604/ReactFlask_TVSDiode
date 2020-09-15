import React from 'react';
import { Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import colors from '../config/colors';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        margin: 'auto',
        marginTop: 20,
        padding: theme.spacing(1,4),
        backgroundColor: colors.background
    },
}));

const MyPaper = props => {
    const classes = useStyles();

    return (
        <Paper className={classes.root} style={{width: props.width || 700, minHeight: props.minHeight || 400}}>{props.children}</Paper>
    )
}

export default MyPaper;
