import React, { useState } from 'react';
import { Select, FormControl, InputLabel, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { navigate } from '@reach/router';
import { useDispatch } from 'react-redux';

import colors from '../config/colors';
import { catRef, usageRef, sizeArr, displayCols } from '../config/categories';
import MyPaper from '../components/MyPaper';

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
        loading===true ? <p>{loading}</p> :
        <div className={classes.root}>
            <MyPaper>
                <h2 className={classes.title}>TVS-Diode Evaluation Tool</h2>
                <p className={classes.subtext}>Select evaluation type</p>
                <p className={classes.error}>
                    {
                        inputError !== '' ? errors[inputError] : ''
                    }
                </p>
                <FormControl className={classes.formControl}>
                    <InputLabel shrink>Evaluation Type</InputLabel>
                    <Select multiple native value={type} onChange={handleChange} className={classes.input} inputProps={{classes: {root: classes.inputBackground,  select: classes.inputColor}}}> 
                        <option value={'Formal'} className={classes.option}>Formal</option>
                        <option value={'2nd Source'} className={classes.option}>2nd Source</option>
                        <option value={'Custom'} className={classes.option}>Custom</option>
                    </Select>
                </FormControl>
                {
                    !catOptions.length ? <></> :
                    <FormControl className={classes.formControl} disabled={!catOptions.length ? true : false}>
                        <InputLabel shrink>2nd Source Category</InputLabel>
                        <Select native value={cat || ''} onChange={handleCatSelect} className={classes.input} inputProps={{classes: {icon: classes.inputColor, select: classes.inputBackground}}}>
                            <option value="">Select</option>
                            {
                                catOptions.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))
                            }
                        </Select>
                    </FormControl>
                }
                <div className={classes.alignRight}>
                    <Button size="small" className={classes.button} onClick={handleSubmit}>Submit</Button>
                </div>
            </MyPaper>
        </div>
    )
}

export default Input;