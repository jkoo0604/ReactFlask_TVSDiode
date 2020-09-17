import React, { useState } from 'react';
import { Button, Select, FormControl, InputLabel } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { navigate } from '@reach/router';

import colors from '../config/colors';
import MyPaper from '../components/MyPaper';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        margin: 'auto',
        backgroundColor: '#fff',
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
        color: colors.neutral00,
        textAlign: 'center'
    },
    subtext: {
        color: colors.neutral40,
        textAlign: 'center'
    },
    formControl: {
        margin: theme.spacing(3),
        minWidth: 300
    },
    input: {
        '&:before': {
            borderColor: colors.neutral00,
            color: colors.neutral00
        },
        '&:after': {
            borderBottom: `2px solid ${colors.actionLight}`,
            backgroundColor: `${colors.background}`
        },
    },
    inputColor: {
        color: colors.neutral40,
        backgroundColor: `${colors.background} !important`,
    },
    inputBackground: {
        backgroundColor: colors.background
    },
    option: {
        // '&:focused': {
        //     backgroundColor: colors.neutral00,
        //     color: colors.neutral100
        // }
        // backgroundColor: colors.background,
        // color: colors.neutral00,
        '&:checked': {
            background: 'linear-gradient(#9ca1ab,#9ca1ab)',
            color: `${colors.background} !important`
        },
        // '&:hover': {
        //     background: '#333641 linear-gradient(#333641,#333641)',
        //     color: `${colors.neutral100} !important`
        // }
    },
    optionchecked: {
        background: '#333641 linear-gradient(#333641,#333641)',
        color: colors.neutral100
    },
    alignRight: {
        textAlign: 'end'
    },
    button: {
        color: colors.action,
        borderWidth: 1,
        borderColor: colors.action,
        borderStyle: 'solid'
    },
    error: {
        color: colors.darkActionDelete,
        height: 15,
        marginBottom: 15,
        textAlign: 'center'
    }
}));

const Evaluator = () => {
    const classes = useStyles();
    const [type, setType] = useState([]);
    const [cat, setCat] = useState(null);
    const [catOptions, setCatOptions] = useState([]);
    const [inputError, setInputError] = useState('');
    const errors = {'custom': 'Custom evaluator currently unavailable', 'nullCat': 'Category is required for second source evaluation', 'noInput': 'Select evaluation type to proceed'};
    
    const handleChange = e => {   
        setInputError('');     
        if (e.target.value === '2nd Source') {
            setCatOptions(Array.from({length: 15}, (_, i) => i + 1));
        } else {
            setCat(null);
            setCatOptions([]);
        };
        setType([e.target.value]);
    };

    const handleCatSelect = e => {
        setInputError(''); 
        setCat(e.target.value);
    }

    const handleSubmit = e => {
        // error check
        let reqBody = {'ref_ids': []};
        if (type[0] === 'Custom') {
            setInputError('custom');
            return;
        } else if (type[0] === '2nd Source' && cat === null) {
            setInputError('nullCat');
            return;
        } else if (!type.length) {
            setInputError('noInput');
            return;
        };

        if (type[0] === 'Formal') {
            reqBody['categories'] = Array.from({length: 15}, (_, i) => i + 1);
        } else {
            reqBody['categories'] = [cat];
        };
        // navigate('/results',{state: {reqBody}});
    }

    return (
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

export default Evaluator;