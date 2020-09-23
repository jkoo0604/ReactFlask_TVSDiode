import React, { useState } from 'react';
import { Select, FormControl, InputLabel, Button, Checkbox, FormControlLabel } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { navigate } from '@reach/router';
import { useSelector, useDispatch } from 'react-redux';

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
    const result = useSelector(state => state.catDef);
    const dispatch = useDispatch();
    const [dropFail, setDropFail] = useState(false);
    // eval
    const [type, setType] = useState([]);
    const [cat, setCat] = useState(null);
    const [catOptions, setCatOptions] = useState([]);
    // select
    const [refDeg, setRefDeg] = useState('');
    const [size, setSize] = useState('');
    const [usage, setUsage] = useState('');
    const [maxFreq, setMaxFreq] = useState('');
    const [foundCat, setFoundCat] = useState([]);
    const [noCat, setNoCat] = useState(false);
    // error check
    const [inputError, setInputError] = useState(false);
    const errors = {'custom': 'Custom evaluator currently unavailable', 'nullCat': 'Category is required for second source evaluation', 'noInput': 'Select evaluation type to proceed', 'noRefDeg': 'Enter Reference Designator for this selection', 'packageSize': 'Select Package Size', 'noInput': 'Select either Usage or Max Operating Frequency', 'noCat': 'No category exists for the selections', 'queryError': 'Error occurred while querying database'};
    
    const handleTypeChange = e => {
        // set states to initial state on the other type
        // render form based on type (eval vs select)

        // setType 
    };

    const handleEvalChange = e => {   
        setInputError('');     
        if (e.target.value === '2nd Source') {
            setCatOptions(Array.from({length: 15}, (_, i) => i + 1));
        } else {
            setCat(null);
            setCatOptions([]);
        };
        setType([e.target.value]);
    };

    const handleEvalCatSelect = e => {
        setInputError(''); 
        setCat(e.target.value);
    };

    const handleSelectUsage = e => {
        setInputError('');
        setMaxFreq('');
        setSize('');
        setNoCat(false);
        setFoundCat(catRef[e.target.value]);
        setUsage(e.target.value);
    };

    const handleSelectFreq = e => {
        setInputError('');
        setUsage('');
        setSize('');
        setNoCat(false);
        setFoundCat(catRef[usageRef[e.target.value]]);
        setMaxFreq(e.target.value);
    };

    const handleSelectSize = e => {
        setInputError('');
        let currentCats = [...foundCat];
        let tempCats = [];
        for (let i=0; i<foundCat.length; i++) {
            if (result['orderedCats'][0]['values'][foundCat[i]-1] === e.target.value) {
                tempCats.push(foundCat[i]);
            }
        };
        if (!tempCats.length) {
            setNoCat(true);
            setFoundCat(currentCats);
        } else {
            setNoCat(false);
            setFoundCat(tempCats);
        };
        setSize(e.target.value);
    };

    const handleSubmit = () => {
        // eval
        let reqBody = {'ref_ids': [], 'dropFail': dropFail};
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
        dispatch({
            type: 'REQUEST',
            request: {'reqType': 'Evaluate', 'reqBody': reqBody}
        });
        navigate('/results',{replace: true});



        // select
        if (refDeg === '') {
            setInputError('noRefDeg');
            return;
        } else if (size === '') {
            setInputError('packageSize');
            return;
        } else if (usage === '' && maxFreq === '') {
            setInputError('noInput');
            return;
        } else if (!foundCat.length && noCat) {
            setInputError('noCat');
            return;
        };
        let reqBody = {'ref_ids': [refDeg], 'categories': foundCat, 'dropFail': dropFail};
        dispatch({
            type: 'REQUEST',
            request: {'reqType': 'Select', 'reqBody': reqBody}
        });        
        navigate('/results',{replace: true});



        // error check
        // create reqBody
        // dispatch
        // navigate to result
    };
    

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

        // from select
        <div className={classes.root}>
        <MyPaper>
            <h2 className={classes.title}>TVS-Diode Selection Tool</h2>
            <p className={classes.subtext}>Enter information below</p>
            <p className={classes.error}>
                {
                    inputError !== '' ? errors[inputError] : ''
                }
            </p>
            <TextField className={classes.input} label="Reference Designator" required value={refDeg} onChange={(e) => setRefDeg(e.target.value)} variant="outlined"/>
            <FormControlLabel control={<Checkbox checked={dropFail} onChange={() => setDropfail(!dropFail)}/>} label={'Exclude failed components'} />
            <FormControl className={classes.formControl}>
                <InputLabel>Usage Type</InputLabel>
                <Select value={usage} onChange={handleUsage} className={classes.input}> 
                    <option value="">Select</option>
                    {
                        Object.keys(catRef).map((item, i) => (
                            <option key={i} value={item}>{item}</option>
                        ))
                    }
                </Select>
                <FormHelperText>If unknown, select Max Operating Frequency</FormHelperText>
            </FormControl>
            <FormControl className={classes.formControl}>
                <InputLabel>Max Operating Frequency</InputLabel>
                <Select value={maxFreq} onChange={handleFreq} className={classes.input}> 
                    <option value="">Select</option>
                    {
                        Object.keys(usageRef).map((item, i) => (
                            <option key={i} value={item}>{item}</option>
                        ))
                    }
                </Select>
                <FormHelperText>Optional</FormHelperText>
            </FormControl>
            <FormControl required className={classes.formControl}>
                <InputLabel>Package Size</InputLabel>
                <Select value={size} onChange={handleSize} className={classes.input}> 
                    <option value="">Select</option>
                    {
                        sizeArr.map((item, i) => (
                            <option key={i} value={item}>{item}</option>
                        ))
                    }
                </Select>
                <FormHelperText>Optional</FormHelperText>
            </FormControl>
            <div className={`${classes.foundCat} ${classes.alignCenter}`}>
                {
                    noCat ? <p>No category found. Please change your selections</p> : foundCat.length === 1 ? <><p>Found Category: {foundCat[0]}</p><Button onClick={handleInput} className={classes.button}>Select</Button></> : foundCat.length > 1 ? <><p>Found Categories: {foundCat.join(', ')}</p><Button onClick={handleInput} className={classes.button}>Select All</Button></> : ''
                }
            </div> 
            <div className={classes.alignRight}>
                <Button size="small" className={classes.button} onClick={handleSubmit}>Submit</Button>
            </div>
        </MyPaper>
        </div>
    )
}

export default Input;