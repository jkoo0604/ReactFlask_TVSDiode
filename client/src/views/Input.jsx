import React, { useState } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel, TextField, FormHelperText } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { navigate } from '@reach/router';
import { useSelector, useDispatch } from 'react-redux';

import colors from '../config/colors';
import { catRef, usageRef } from '../config/categories';
import MyToggle from '../components/MyToggle';
import MyHeader from '../components/MyHeader';
import MyButton from '../components/MyButton';

const useStyles = makeStyles((theme) => ({
    root: {        
        margin: 'auto',
        backgroundColor: colors.backgroundSite,
        minHeight: '100vh',
        alignContent: 'center',
        justifyContent: 'center',
        textAlign: 'center'
    },
    content: {
        width: '60%',
        margin: 'auto',
        padding: '30px'
    },
    error: {
        color: colors.textError,
        height: 25,
        fontSize: 14
    },
    toggle: {
        display: 'flex',
        justifyContent: 'center'
    },
    title: {
        textAlign: 'left',
        fontSize: 18,
        fontWeight: 'bolder',
        padding: '0px 30px'
    },
    desc: {
        textAlign: 'left',
        padding: '0px 30px',
        marginBottom: '35px'
    },
    evalForm: {
        margin: 'auto',
        padding: '0px 30px',
        width: '100%'
    },
    evalInput: {
        // width: '45%',
        // overflow: 'auto',
    },
    selectForm: {
        margin: 'auto',
        padding: '0px 30px',
        width: '100%',
    },
    selectInput: {
        width: '100%'
    },
    selectCheck: {
        width: '100%',
        display: 'block',
        textAlign: 'right'
    },
    dropdownWrapper: {
        display: 'flex',
    },
    dropdown: {
        width: '50%',
        display: 'inline-block',
    },
    formControl: {
        width: '95%',
    },
    inputStyle: {
        backgroundColor: colors.backgroundTable,
        textAlign: 'left',
        borderRadius: 5
    },
    divider: {
        height: 20,
        borderBottomColor: colors.backgroundAccordion,
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        opacity: '0.2',
        marginBottom: '25px'
    },
    textLeft: {
        textAlign: 'left'
    },
    textRight: {
        textAlign: 'right'
    },
    foundCat: {
        color: colors.textConfirm,
        height: '35px'
    },
    foundCatText: {
        fontSize: 12,
        margin: 0,
        padding: 0
    }
}));

const Input = () => {
    const classes = useStyles();
    const result = useSelector(state => state.catDef);
    const dispatch = useDispatch();
    const [dropFail, setDropFail] = useState(false);
    const [type, setType] = useState('Evaluate');
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
    
    const handleTypeChange = newVal => {
        if (newVal === type) return;
        // set states to initial state on the other type
        if (newVal === 'Evaluate') {
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
        setInputError('');
        setSelectedCats([]);
        setType(newVal);
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
        console.log('onchange');
        let tempCats = [];
        for (let i=0; i<catRef[e.target.value].length; i++) {
            tempCats.push(result['orderedCats'][1]['values'][catRef[e.target.value][i]-1]);
        };
        let tempCatsDeduped = ([...new Set(tempCats)]);
        console.log(tempCatsDeduped);
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

    const handleSelectSize = e => {
        console.log('onchange size');
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

        setInputError('');
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
        <div className={classes.root}>
            <MyHeader title={'TVS-Diode Tool'} />
            <div className={classes.content}>
                <div className={classes.toggle}>
                    <MyToggle type={type} handleTypeChange={handleTypeChange} position={'left'} value={'Evaluate'} />
                    <MyToggle type={type} handleTypeChange={handleTypeChange} position={'right'} value={'Select'} />
                </div>
                <p className={classes.title}>{type}</p>
                <p className={classes.desc}>
                    {
                        type === 'Evaluate' ? 
                        <>Select <span style={{fontWeight: 'bold'}}>formal</span> to view components in all categories for evaluation. Choose a <span style={{fontWeight: 'bold'}}>2nd source category</span> to limit results to a single category.</> :
                        <>Choose <span style={{fontWeight: 'bold'}}>usage type</span> or <span style={{fontWeight: 'bold'}}>maximum operating frequency</span> to look up components in the category matching the criteria.</>
                    }
                </p>
                {/* <p className={classes.error}>
                    {
                        inputError !== '' ? errors[inputError] : ''
                    }
                </p> */}
                {
                    type === '' ? <></> : type === 'Evaluate' ? 
                    <div className={classes.evalForm}>
                        <div className={classes.dropdownWrapper}>
                        <div className={`${classes.dropdown} ${classes.textLeft}`}>
                        <FormControl required variant='filled' className={classes.formControl} error={inputError === 'noEvalInput' || inputError === 'custom'}>
                            <InputLabel shrink>Evaluation Type</InputLabel>
                            <Select value={evalType} onChange={handleEvalChange} className={classes.evalInput}inputProps={{classes: {root: classes.inputStyle}}}>
                                <MenuItem value=""><em>Select</em></MenuItem>
                                <MenuItem value={'Formal'}>Formal</MenuItem>
                                <MenuItem value={'2nd Source'}>2nd Source</MenuItem>
                                <MenuItem value={'Custom'}>Custom</MenuItem>
                            </Select>
                            <FormHelperText>Required</FormHelperText>
                        </FormControl>
                        </div>
                        <div className={`${classes.dropdown} ${classes.textRight}`}>
                        {
                            !catOptions.length ? <div className={classes.formControl}></div> :
                            <FormControl variant='filled' className={classes.formControl} disabled={!catOptions.length ? true : false} error={inputError === 'nullCat'}>
                                <InputLabel shrink>2nd Source Category</InputLabel>
                                <Select value={cat || ''} onChange={handleEvalCatSelect} className={classes.evalInput} inputProps={{classes: {root: classes.inputStyle}}}>
                                    <MenuItem value=""><em>Select</em></MenuItem>
                                    {
                                        catOptions.map((category) => (
                                            <MenuItem key={category} value={category}>{category}</MenuItem>
                                        ))
                                    }
                                </Select>
                            </FormControl>
                        }
                        </div>
                        </div>
                    </div> :
                    <div className={classes.selectForm}>
                        <TextField className={classes.selectInput} label="Reference Designator" required value={refDeg} onChange={(e) => setRefDeg(e.target.value)} variant="filled" InputProps={{classes: {root: classes.inputStyle}}} error={inputError === 'noRefDeg'} helperText='Required' />
                        {/* <FormControlLabel control={<Checkbox checked={dropFail} onChange={() => setDropFail(!dropFail)} fontSize='small' color='default'/>} label={'Exclude failed components'} size='small' className={classes.selectCheck} /> */}

                        <div className={classes.dropdownWrapper}>
                        <div className={`${classes.dropdown} ${classes.textLeft}`}>
                        <FormControl className={classes.formControl} variant='filled'>
                            <InputLabel>Usage Type</InputLabel>
                            <Select value={usage} onChange={handleSelectUsage} className={classes.evalInput} inputProps={{classes: {root: classes.inputStyle}}}> 
                                <MenuItem value=""><em>Select</em></MenuItem>
                                {
                                    Object.keys(catRef).map((item, i) => (
                                        <MenuItem key={i} value={item}>{item}</MenuItem>
                                    ))
                                }
                            </Select>
                            <FormHelperText>If unknown, select Max Operating Frequency</FormHelperText>
                        </FormControl>
                        </div>
                        <div className={`${classes.dropdown} ${classes.textRight}`}>
                        <FormControl className={classes.formControl} variant='filled'>
                            <InputLabel>Max Operating Frequency</InputLabel>
                            <Select value={maxFreq} onChange={handleSelectFreq} className={classes.evalInput} inputProps={{classes: {root: classes.inputStyle}}}> 
                                <MenuItem value=""><em>Select</em></MenuItem>
                                {
                                    Object.keys(usageRef).map((item, i) => (
                                        <MenuItem key={i} value={item}>{item}</MenuItem>
                                    ))
                                }
                            </Select>
                            <FormHelperText>Optional</FormHelperText>
                        </FormControl>
                        </div>
                        </div>
                        <div className={classes.dropdownWrapper}>
                        <div className={`${classes.dropdown} ${classes.textLeft}`}>
                        <FormControl className={classes.formControl} variant='filled'>
                            <InputLabel>Package Size</InputLabel>
                            <Select value={size} onChange={handleSelectSize} className={classes.evalInput} inputProps={{classes: {root: classes.inputStyle}}}> 
                                <MenuItem value=""><em>Select</em></MenuItem>
                                {
                                    sizeOptions.map((item, i) => (
                                        <MenuItem key={i} value={item}>{item}</MenuItem>
                                    ))
                                }
                            </Select>
                            <FormHelperText>Optional</FormHelperText>
                        </FormControl>
                        </div>
                        <div className={`${classes.dropdown} ${classes.textRight}`}>
                            <FormControlLabel control={<Checkbox checked={dropFail} onChange={() => setDropFail(!dropFail)} fontSize='small' color='default'/>} label={'Exclude failed components'} size='small' className={classes.selectCheck} />
                        </div>
                        </div>
                        <div className={`${classes.foundCat} ${classes.alignCenter}`}>
                            {
                                noCat ? <p><span style={{fontWeight: 'bold', color: colors.textError}}>No matching category found. Please change your selections</span></p> : selectedCats.length === 1 ? <p>Matching Category: <span style={{fontWeight: 'bold'}}>{selectedCats[0]}</span></p> : (foundCat.length > 1 && !selectedCats.length) ? <><p>Matching Categories: <span style={{fontWeight: 'bold'}}>{foundCat.join(', ')}</span></p><p className={classes.foundCatText}>Choose package size to narrow down to a single category.</p></> : ''
                            }
                        </div> 
                    </div>
                }
                <div className={classes.divider} />               
                <div style={{opacity: inputError.length ? '0.6' : '1', pointerEvents: inputError.length ? 'none' : 'auto'}}>
                    <MyButton value='submit' handleSubmit={handleSubmit} bgColor={colors.backgroundButton} borderColor={colors.backgroundButton} fontColor={colors.textLabel} useIcon={false}/>
                </div>
            </div>
        </div>
    )
}

export default Input;