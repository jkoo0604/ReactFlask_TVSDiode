import React, { useState, useEffect } from 'react';
import { navigate } from '@reach/router';
import { Tabs, Tab } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import colors from '../config/colors';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
}));

const Start = () => {
    const classes = useStyles();
    const [value, setValue] = useState(0);
    const paths = ['/eval', '/select'];

    const handleChange = newVal => {
        console.log(newVal);
        setValue(newVal);
        navigate(paths[newVal]);
    };

    return (
        <div className={classes.root}>
            <Tabs value={value} indicatorColor={} textColor={} onChange={handleChange} centered>
                <Tab label='Evaluator' />
                <Tab label='Selector' />
            </Tabs>
        </div>
    )

};

export default Start;