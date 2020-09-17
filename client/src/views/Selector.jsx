import React, { useState, useEffect } from 'react';
import { Button, Select, TextField, FormControl, InputLabel, FormHelperText } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { navigate } from '@reach/router';

import colors from '../config/colors';
import { catRef, usageRef, sizeArr, displayCols } from '../config/categories';
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
    alignRight: {
        textAlign: 'end'
    },
    alignCenter: {
        textAlign: 'center'
    },
    foundCat: {
        backgroundColor: colors.background
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
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState({});
    const [refDeg, setRefDeg] = useState('');
    const [size, setSize] = useState('');
    const [usage, setUsage] = useState('');
    const [maxFreq, setMaxFreq] = useState('');
    const [foundCat, setFoundCat] = useState([]);
    const [noCat, setNoCat] = useState(false);
    const [inputError, setInputError] = useState('');
    const errors = {'noRefDeg': 'Enter Reference Designator for this selection', 'packageSize': 'Select Package Size', 'noInput': 'Select either Usage or Max Operating Frequency', 'noCat': 'No category exists for the selections', 'queryError': 'Error occurred while querying database'};

    useEffect(() => {
        fetch('/getcatdef').then(r => r.json()).then(res => {
        if (res['result_status'] === 'Failure') {
            setInputError('queryError');
        } else {
            // console.log('status: ', res['result_status']);
            console.log('data: ', res['data']);
            let data = res['data'];
            let ordered = [];
            for (let i=1; i<data.columns.length; i++) {
                if (displayCols.includes(data.columns[i])) {
                    ordered.push({});
                    ordered[ordered.length-1]['name'] = data.columns[i];
                    ordered[ordered.length-1]['values'] = [];
                    for (let j=0; j<data.data.length; j++) {
                        ordered[ordered.length-1]['values'].push(data.data[j][i]);
                    }
                }
            }
            // [{name: 'col1', values: [row1, row2, row3]}, {name: col2, values:[]}]
            console.log(ordered);
            setResult({'orderedCats': ordered, 'allCats': data.data, 'colList': data.columns});
            setLoading(false);
        }
        })
        .catch(error => {
            console.log(error);
        })
    }, []);
    
    const handleUsage = e => {
        setInputError('');
        setMaxFreq('');
        setSize('');
        setNoCat(false);
        setFoundCat(catRef[e.target.value]);
        setUsage(e.target.value);
    };

    const handleFreq = e => {
        setInputError('');
        setUsage('');
        setSize('');
        setNoCat(false);
        setFoundCat(catRef[usageRef[e.target.value]]);
        setMaxFreq(e.target.value);
    };

    const handleSize = e => {
        setInputError('');
        let tempCats = [];
        for (let i=0; i<foundCat.length; i++) {
            if (result['orderedCats'][1]['values'][foundCat[i]-1] === e.target.value) {
                tempCats.push(foundCat[i]);
            }
        };
        if (!tempCats.length) {
            setNoCat(true);
            setFoundCat([]);
        } else {
            setNoCat(false);
            setFoundCat(tempCats);
        };
        setSize(e.target.value);
    };

    const handleInput = e => {
        
    }

    const handleSubmit = e => {
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
        let reqBody = {'ref_ids': [refDeg], 'categories': foundCat};
        // navigate('/results',{replace: true, state: {reqBody, 'cats': result, 'reqType': 'Select'}});
    }

    return (
        loading===true ? <p>{loading}</p> :
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
                        foundCat.length === 1 ? <><p>Found Category: {foundCat[0]}</p><Button onClick={handleInput} className={classes.button}>Select</Button></> : foundCat.length > 1 ? <><p>Found Categories: {foundCat}</p><Button onClick={handleInput} className={classes.button}>Select All</Button></> : noCat ? <p>No category found. Please change your selections</p> : ''
                    }
                </div> 
                <div className={classes.alignRight}>
                    <Button size="small" className={classes.button} onClick={handleSubmit}>Submit</Button>
                </div>
            </MyPaper>
        </div>
    )
}

export default Evaluator;