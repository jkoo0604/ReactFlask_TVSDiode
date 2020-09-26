import React, { useState } from 'react';
import { Radio, RadioGroup, Select, FormControl, InputLabel, Button, Checkbox, FormControlLabel, TextField, FormHelperText, FormLabel } from '@material-ui/core';
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
        backgroundColor: colors.backgroundSite,
        minHeight: '100vh',
        alignContent: 'center',
        justifyContent: 'center'
    },
    card: {
        width: '80%',
        alignSelf: 'center',
        backgroundColor: colors.backgroundTable,
        padding: 15
    },
    title: {
        color: colors.textNormal
    },
    subtext: {
        color: colors.textNormal,
    },
    input: {
        width: 350,
        overflow: 'auto',
        // "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
        //     borderColor: colors.darkNeutral60
        // },
        // "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
        // borderColor: colors.darkNeutral100
        // },
        // "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        // borderColor: colors.darkActionLight
        // },
        // "& .MuiOutlinedInput-input": {
        // color: colors.darkNeutral100
        // },
        // "&:hover .MuiOutlinedInput-input": {
        // color: colors.darkNeutral100
        // },
        // "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-input": {
        // color: colors.darkNeutral100
        // },
        // "& .MuiInputLabel-outlined": {
        // color: colors.darkNeutral60
        // },
        // "&:hover .MuiInputLabel-outlined": {
        // color: colors.darkNeutral100
        // },
        // "& .MuiInputLabel-outlined.Mui-focused": {
        // color: colors.darkActionLight
        // }
    },
    inputColor: {
        color: colors.textNormal,
        overflow: 'auto'
    },
    alignRight: {
        justifyContent: 'flex-end',
    },
    button: {
        color: colors.textLabel,
        backgroundColor: colors.backgroundButton
    },
    error: {
        color: colors.textError,
        marginBottom: 30
    },
    foundCat: {
        color: colors.textConfirm
    },
    evalInput: {
        width: 350,
        overflow: 'auto',
    }
}));

const Input = () => {
    const classes = useStyles();
    const result = useSelector(state => state.catDef);
    const dispatch = useDispatch();
    const [dropFail, setDropFail] = useState(false);
    const [type, setType] = useState('');
    // eval
    const [evalType, setEvalType] = useState('');
    const [cat, setCat] = useState(null);
    const [catOptions, setCatOptions] = useState([]);
    // select
    const [refDeg, setRefDeg] = useState('');
    const [size, setSize] = useState('');
    const [usage, setUsage] = useState('');
    const [maxFreq, setMaxFreq] = useState('');
    const [foundCat, setFoundCat] = useState([]);
    const [selectedCats, setSelectedCats] = useState([]);
    const [noCat, setNoCat] = useState(false);
    const [sizeOptions, setSizeOptions] = useState([]);
    // error check
    const [inputError, setInputError] = useState(false);
    const errors = {'noInput': 'Select Tool Type', 'custom': 'Custom evaluator currently unavailable', 'nullCat': 'Category is required for second source evaluation', 'noEvalInput': 'Select evaluation type to proceed', 'noRefDeg': 'Enter Reference Designator for this selection', 'packageSize': 'Select Package Size', 'noSelectInput': 'Select either Usage or Max Operating Frequency', 'noCat': 'No category exists for the selections', 'queryError': 'Error occurred while querying database'};
    
    const handleTypeChange = e => {
        // set states to initial state on the other type
        if (e.target.value === 'Evaluate') {
            setRefDeg('');
            setSize('');
            setUsage('');
            setMaxFreq('');
            setFoundCat([]);
            setNoCat(false);
        } else {
            setEvalType('');
            setCat(null);
            setCatOptions([]);
        };
        // setType 
        setType(e.target.value);
    };

    const handleEvalChange = e => {  
        console.log(e.target.value); 
        setInputError('');     
        if (e.target.value === '2nd Source') {
            setCatOptions(Array.from({length: 15}, (_, i) => i + 1));
        } else {
            setCatOptions([]);
        };
        setCat(null);
        setEvalType(e.target.value);
    };

    const handleEvalCatSelect = e => {
        setInputError(''); 
        setCat(e.target.value);
    };

    const handleSelectUsage = e => {
        let tempCats = [];
        for (let i=0; i<catRef[e.target.value].length; i++) {
            tempCats.push(result['orderedCats'][1]['values'][catRef[e.target.value][i]-1]);
        };
        let tempCatsDeduped = ([...new Set(tempCats)]);
        if (tempCatsDeduped.length === 1) {
            setSize(tempCatsDeduped[0]);
        };
        setSizeOptions(tempCatsDeduped);
        setInputError('');
        setMaxFreq('');
        setSize('');
        setNoCat(false);
        setSelectedCats([]);
        setFoundCat(catRef[e.target.value]);
        setUsage(e.target.value);
    };

    const handleSelectFreq = e => {
        let tempCats = [];
        for (let i=0; i<catRef[usageRef[e.target.value]].length; i++) {
            tempCats.push(result['orderedCats'][1]['values'][catRef[usageRef[e.target.value]][i]-1]);
        };
        let tempCatsDeduped = ([...new Set(tempCats)]);
        if (tempCatsDeduped.length === 1) {
            setSize(tempCatsDeduped[0]);
        };
        setSizeOptions(tempCatsDeduped);
        setInputError('');
        setUsage('');
        setSize('');
        setNoCat(false);
        setSelectedCats([]);
        setFoundCat(catRef[usageRef[e.target.value]]);
        setMaxFreq(e.target.value);
    };

    const updateSizeOptions = (cats) => {
        let tempCats = [];
        for (let i=0; i<cats.length; i++) {
            tempCats.push(result['orderedCats'][1]['values'][cats[i]-1]);
        };
        let tempCatsDeduped = ([...new Set(tempCats)]);
        if (tempCatsDeduped.length === 1) {
            setSize(tempCatsDeduped[0]);
        };
        setSizeOptions(tempCatsDeduped);
    };

    const handleSelectSize = e => {
        setInputError('');
        let tempCats = [];
        for (let i=0; i<foundCat.length; i++) {
            if (result['orderedCats'][1]['values'][foundCat[i]-1] === e.target.value) {
                tempCats.push(foundCat[i]);
            }
        };
        console.log(tempCats);
        if (!tempCats.length) {
            setNoCat(true);
        } else {
            setNoCat(false);
            setSelectedCats(tempCats);
        };
        setSize(e.target.value);
    };

    const handleSubmit = () => {
        if (!type) {
            setInputError('noInput');
            return;
        }
        // eval
        let reqBody = {'dropFail': dropFail};
        if (type === 'Evaluate') {
            if (evalType === 'Custom') {
                setInputError('custom');
                return;
            } else if (evalType === '2nd Source' && cat === null) {
                setInputError('nullCat');
                return;
            } else if (!evalType.length) {
                setInputError('noEvalInput');
                return;
            };
    
            if (evalType === 'Formal') {
                reqBody['categories'] = Array.from({length: 15}, (_, i) => i + 1);
            } else {
                reqBody['categories'] = [cat];
            };
            reqBody['ref_ids'] = [];
        } else {
            if (refDeg === '') {
                setInputError('noRefDeg');
                return;
            } else if (size === '') {
                setInputError('packageSize');
                return;
            } else if (usage === '' && maxFreq === '') {
                setInputError('noSelectInput');
                return;
            } else if (!foundCat.length || noCat) {
                setInputError('noCat');
                return;
            };
            reqBody['ref_ids'] = [refDeg];
            reqBody['categories'] = selectedCats;
            console.log(reqBody);
        };

        dispatch({
            type: 'REQUEST',
            request: {'reqType': type, 'reqBody': reqBody}
        });
        navigate('/results',{replace: true});
    };
    

    return (
        // loading===true ? <p>{loading}</p> :
        <div className={classes.root}>
            <MyPaper className={classes.card}>
                <h2 className={classes.title}>TVS-Diode Tool</h2>
                <p className={classes.subtext}>Select Tool Type</p>
                <p className={classes.error}>
                    {
                        inputError !== '' ? errors[inputError] : ''
                    }
                </p>
                <FormControl component='fieldset' className={classes.formControl}>
                    <FormLabel component='legend'>Tool Type</FormLabel>
                    <RadioGroup name='type' value={type} onChange={handleTypeChange}>
                        <FormControlLabel value='Evaluate' control={<Radio color='default' />} label='Evaluate' />
                        <FormControlLabel value='Select' control={<Radio color='default' />} label='Select' />
                    </RadioGroup>
                </FormControl>
                {/* <div className={classes.formControl}>
                    <Radio checked={type === 'Evaluate'} onChange={handleTypeChange} value='Evaluate' color='default' name='evaluate'/>
                    <Radio checked={type === 'Select'} onChange={handleTypeChange} value='Select' color='default' name='select'/>
                </div> */}
                {
                    type === '' ? <></> : type === 'Evaluate' ? 
                    <div className={classes.evalForm}>
                        <FormControl className={classes.formControl}>
                            {/* <InputLabel shrink>Evaluation Type</InputLabel> */}
                            <p>Evaluation Type</p>
                            <select size={3} value={evalType} onChange={handleEvalChange} className={classes.evalInput} > 
                                <option hidden disabled value=''>Select</option>
                                <option value={'Formal'} className={classes.option}>Formal</option>
                                <option value={'2nd Source'} className={classes.option}>2nd Source</option>
                                <option value={'Custom'} className={classes.option}>Custom</option>
                            </select>
                        </FormControl>
                        {
                            !catOptions.length ? <></> :
                            <FormControl className={classes.formControl} disabled={!catOptions.length ? true : false}>
                                <InputLabel shrink>2nd Source Category</InputLabel>
                                <Select native value={cat || ''} onChange={handleEvalCatSelect} className={classes.input} inputProps={{classes: {icon: classes.inputColor, select: classes.inputBackground}}}>
                                    <option value="">Select</option>
                                    {
                                        catOptions.map((category) => (
                                            <option key={category} value={category}>{category}</option>
                                        ))
                                    }
                                </Select>
                            </FormControl>
                        }
                    </div> :
                    <div className={classes.selectForm}>
                        <TextField className={classes.input} label="Reference Designator" required value={refDeg} onChange={(e) => setRefDeg(e.target.value)} variant="outlined"/>
                        <FormControlLabel control={<Checkbox checked={dropFail} onChange={() => setDropFail(!dropFail)}/>} label={'Exclude failed components'} />
                        <FormControl className={classes.formControl}>
                            <InputLabel>Usage Type</InputLabel>
                            <Select value={usage} onChange={handleSelectUsage} className={classes.input}> 
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
                            <Select value={maxFreq} onChange={handleSelectFreq} className={classes.input}> 
                                <option value="">Select</option>
                                {
                                    Object.keys(usageRef).map((item, i) => (
                                        <option key={i} value={item}>{item}</option>
                                    ))
                                }
                            </Select>
                            <FormHelperText>Optional</FormHelperText>
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <InputLabel>Package Size</InputLabel>
                            <Select value={size} onChange={handleSelectSize} className={classes.input}> 
                                <option value="">Select</option>
                                {
                                    sizeOptions.map((item, i) => (
                                        <option key={i} value={item}>{item}</option>
                                    ))
                                }
                            </Select>
                            <FormHelperText>Optional</FormHelperText>
                        </FormControl>
                        <div className={`${classes.foundCat} ${classes.alignCenter}`}>
                            {
                                noCat ? <p>No category found. Please change your selections</p> : selectedCats.length === 1 ? <p>Found Category: {selectedCats[0]}</p> : (foundCat.length > 1 && !selectedCats.length) ? <><p>Possible Categories: {foundCat.join(', ')}</p><p>Select Package Size</p></> : ''
                            }
                        </div> 
                    </div>
                }               
                <div className={classes.alignRight}>
                    <Button size="small" className={classes.button} onClick={handleSubmit}>Submit</Button>
                </div>
            </MyPaper>
        </div>
    )
}

export default Input;