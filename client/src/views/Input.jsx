import React, { useState } from 'react';
import { Card, CardActions, CardContent, Typography, Grid, TextField, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { navigate } from '@reach/router';

import colors from '../config/colors';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        margin: 'auto',
        backgroundColor: colors.darkBackground,
        minHeight: '100vh',
        alignContent: 'center',
        justifyContent: 'center'
    },
    card: {
        width: '80%',
        alignSelf: 'center',
        backgroundColor: colors.darkBackgroundCard,
        padding: 15
    },
    title: {
        color: colors.darkNeutral100
    },
    subtext: {
        color: colors.darkNeutral60,
    },
    input: {
        width: 350,
        "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.darkNeutral60
        },
        "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.darkNeutral100
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.darkActionLight
        },
        "& .MuiOutlinedInput-input": {
        color: colors.darkNeutral100
        },
        "&:hover .MuiOutlinedInput-input": {
        color: colors.darkNeutral100
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-input": {
        color: colors.darkNeutral100
        },
        "& .MuiInputLabel-outlined": {
        color: colors.darkNeutral60
        },
        "&:hover .MuiInputLabel-outlined": {
        color: colors.darkNeutral100
        },
        "& .MuiInputLabel-outlined.Mui-focused": {
        color: colors.darkActionLight
        }
    },
    inputColor: {
        color: colors.darkNeutral60
    },
    alignRight: {
        justifyContent: 'flex-end',
    },
    button: {
        color: colors.darkAction
    },
    error: {
        color: colors.darkActionDelete,
        marginBottom: 30
    }
}));

const Input = () => {
    const classes = useStyles();
    const [refNums, setRefNums] = useState('');
    const [inputError, setInputError] = useState(false);
    // const [checkinput, setCheckInput] = useState('');
    
    const handleInput = e => {
        e.preventDefault();
        let tempRefList = refNums.split(/[,\r?\n\s+]+/);
        tempRefList = tempRefList.filter(function(e){return e});
        let refList = [...new Set(tempRefList)];
        // setCheckInput(refList);
        if (!refList.length) {
            setInputError(true);
            return;
        }
        navigate('/cat',{state: {refList}});
    }

    return (
        <Grid container className={classes.root}>
            <Card className={classes.card}>
                <CardContent>
                    <Typography className={classes.title} gutterBottom variant="h4">
                        Enter Reference IDs
                    </Typography>
                    <Typography className={classes.subtext} variant="subtitle2">
                        Enter multiple IDs separated by a comma or a new line
                    </Typography>
                    <Typography className={classes.error} variant="subtitle2">
                        { inputError ? 'Enter at least one Reference ID' : '' }
                    </Typography>
                    <TextField className={classes.input} label="Reference IDs" multiline required rows={5} value={refNums} onChange={(e) => setRefNums(e.target.value)} variant="outlined"/>
                </CardContent>
                <CardActions className={classes.alignRight}>
                    <Button size="small" className={classes.button} onClick={(e) => handleInput(e)}>Continue</Button>
                </CardActions>
            </Card>
        </Grid>
    )
}

export default Input;