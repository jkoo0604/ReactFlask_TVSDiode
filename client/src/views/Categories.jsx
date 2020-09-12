import React, { useState, useEffect } from 'react';
import { Card, CardActions, CardContent, Typography, Grid, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, InputLabel, FormControl } from '@material-ui/core';
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
    alignRight: {
        justifyContent: 'flex-end',
    },
    alignLeft: {
        justifyContent: 'flex-start',
    },
    alignCenter: {
        justifyContent: 'center',
        textAlign: 'center'
    },
    alignBetween: {
        justifyContent: 'space-between'
    },
    button: {
        color: colors.darkAction
    },
    backButton: {
        color: colors.darkActionDelete
    },
    error: {
        color: colors.darkActionDelete,
        marginBottom: 30
    },
    paper: {
        width: '70%',
        alignContent: 'center',
        backgroundColor: colors.darkBackgroundCard,
    },
    container: {
        maxHeight: 440,
    },
    header: {
        backgroundColor: colors.darkBackground
    },
    cell: {
        color: colors.darkNeutral100,
        borderBottom: 'solid',
        borderBottomWidth: 0.5,
        borderBottomColor: colors.darkNeutral40
    },
    select: {
        color: colors.darkActionLight
    },
    catdefModal: {
        width: 1000,
        height: 700
    },
    selectModal: {
        width: 1000,
        height: 700,
        alignSelf: 'center',
        justifyContent: 'center'
    },
    form: {
        margin: theme.spacing(1),
        minWidth: 150
    },
    foundCat: {
        minHeight: 60,
        backgroundColor: colors.darkNeutral60,
        marginTop: 25,
    }
}));

const Categories = props => {
    const classes = useStyles();
    const displayCols = ['Category','Package Size', 'Package Type', 'Polarity', 'V - rwm Type (V)', 'V-br (V-Trig) - Min (V)', 'V-br (V-Trig) - Max (V)', '(Vbr or Vtrig) max - Vrwm', 'I - Holding Min (mA)', 'C-J Max (pF)'];
    const [queryError, setQueryError] = useState(null);
    const [result, setResult] = useState({});
    // const [colList, setColList] = useState([]);
    // const [allCats, setAllCats] = useState([]);
    // const [orderedCats, setOrderedCats] = useState([]);
    const [inputError, setInputError] = useState(false);
    const [selectError, setSelectError] = useState(false);
    const [inputCats, setInputCats] = useState([]);
    const [open, setOpen] = useState(false);
    const [catDefOpen, setCatDefOpen] = useState(false);
    const [dialogId, setDialogId] = useState(0);
    const [selectedVals, setSelectedVals] = useState(new Array(displayCols.length));
    const [currentOptions, setCurrentOptions] = useState([null,[]]);
    const [validRows, setValidRows] = useState([]);
    const [cat, setCat] = useState(null);
    const [loading, setLoading] = useState(true);
    const {refList} = props.location.state;
    
    useEffect(() => {
        fetch('/getcatdef').then(r => r.json()).then(res => {
        if (res['result_status'] === 'Failure') {
            setQueryError(res['message']);
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
            // setOrderedCats(ordered);
            // setAllCats(data.data);
            // setColList(data.columns);
            setLoading(false);
        }
        })
        .catch(error => {
            console.log(error);
        })
    }, []);

    const handleSubmit = e => {
        e.preventDefault();
        setSelectError(false);
        if (inputError || queryError) return;
        let checkInputs = inputCats.filter(function(e){return e});
        if (checkInputs.length !== refList.length) {
            setSelectError(true);
            return;
        };
        let input = {'ref_ids': refList, 'categories': inputCats};
        fetch('/getresults', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(input)}).then(r => r.json()).then(res => {
            if (res['result_status'] !== 'Failure' && res['result_status'] !== 'No Data') {
                if (refList.length !== res['results_data']['ref_id'].length) {
                    setQueryError('Ref IDs do not match');
                    return;
                }
            }
            let queryResult = {};
            if (res['result_status'] === 'Failure') {
                setQueryError(res['message']);
                return;
            } else if (res['result_status'] === 'No Data') {
                queryResult = {'message': 'no data'};
            } else if (res['result_status'] === 'No Ranking') {
                queryResult = {'message': 'one result', 'data': res['results_data'], 'output': res['output_data']};
            } else {
                queryResult = {'message': 'all results', 'data': res['results_data'], 'output': res['output_data']};
            }
            console.log(queryResult);
            navigate('/results',{state: {queryResult, 'catDef': result['allCats'], 'colList': result['colList']}});
        })
        .catch(error => {
            console.log(error);
        })

    }

    const handleInput = () => {
        let tempInputs = [...inputCats];
        let foundRow = validRows[currentOptions.length-2][0];
        tempInputs[dialogId] = result['orderedCats'][0]['values'][foundRow];
        setInputCats(tempInputs);
        setOpen(false);
    }

    const handleBack = () => {
        navigate('/load', {replace: true});
    }

    const handleSelect = idx => {
        setDialogId(idx);
        setCurrentOptions([null,[...new Set(result['orderedCats'][1]['values'])]]);
        setValidRows(new Array(displayCols.length));
        setSelectedVals(new Array(displayCols.length));
        setCat(null);
        setOpen(true);
    }

    const handleSelectInput = (e, colId) => {
        // console.log(e.target.value, colId);
        setCat(null);
        let tempSelected = [...selectedVals];
        let tempValid = [...validRows];
        let tempCurrent = [...currentOptions];

        for (let i=colId; i<result['orderedCats'][colId]['values'].length; i++) {
            tempSelected[i] = undefined;
            tempValid[i] = undefined;
        }
        if (tempCurrent.length > colId+1) tempCurrent = tempCurrent.slice(0,colId+1);

        tempSelected[colId] = e.target.value;
        tempValid[colId] = [];

        if (colId===1) {
            for (let i=0; i<result['orderedCats'][colId]['values'].length; i++) {
                if (result['orderedCats'][colId]['values'][i] === e.target.value) {
                    tempValid[colId].push(i);
                }
            };
        } else {
            for (let i=0; i<result['orderedCats'][colId]['values'].length; i++) {
                if (result['orderedCats'][colId]['values'][i] === e.target.value && tempValid[colId-1].includes(i)) {
                    tempValid[colId].push(i);
                }
            };
        }

        tempCurrent[colId+1] = [];
        for (let i=0; i<result['orderedCats'][colId+1]['values'].length; i++) {
            if (tempValid[colId].includes(i)) {
                tempCurrent[colId+1].push(result['orderedCats'][colId+1]['values'][i]);
            }
        }
        tempCurrent[colId+1] = [...new Set(tempCurrent[colId+1])];
        // console.log(tempValid);
        
        if (tempValid[colId].length === 1) setCat(result['orderedCats'][0]['values'][tempValid[colId][0]]);
        setSelectedVals(tempSelected);
        setValidRows(tempValid);
        setCurrentOptions(tempCurrent);
    }

    if (!refList.length) {
        setInputError(true);
    }

    return (  
        loading===true ? <Typography variant='subtitle2'>Loading</Typography> :
        <>      
        <Grid container align='center' className={classes.root}>
            <Card className={classes.card}>
                <CardActions className={classes.alignBetween}>
                    <Button size="small" className={classes.backButton} onClick={handleBack}>Reset</Button>
                    <Button size="small" className={classes.button} onClick={() => setCatDefOpen(true)}>See All Category Definitions</Button>
                </CardActions>
                <CardContent>
                    <Typography className={classes.title} gutterBottom variant="h4">
                        Select Categories
                    </Typography>
                    <Typography className={classes.subtext} variant="subtitle2">
                        Click on 'Select' to choose categories for each Reference ID
                    </Typography>
                    <Typography className={classes.error} variant="subtitle2">
                        { inputError ? 'At least one Reference ID is required\nClick the Back button to return and enter valid Reference IDs' : queryError ? queryError : selectError ? 'Categories are required for all Reference IDs' : '' }
                    </Typography>
                    <Paper className={classes.paper} elevation={5}>
                        <TableContainer className={classes.container}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align='center' className={`${classes.header} ${classes.cell}`}>
                                            Reference ID
                                        </TableCell>
                                        <TableCell align='center' className={`${classes.header} ${classes.cell}`}>
                                            Category
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        refList.map((ref, idx) => 
                                        <TableRow hover key={ref}>
                                            <TableCell align='center' className={classes.cell}>
                                                {ref}
                                            </TableCell>
                                            <TableCell align='center' className={classes.cell}>
                                                <Button size="small" className={classes.select} onClick={() => handleSelect(idx)}>{!inputCats[idx] ? 'Select' : 'Category ' + inputCats[idx]}</Button>
                                            </TableCell>
                                        </TableRow>)
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </CardContent>
                <CardActions className={classes.alignRight}>
                    <Button size="small" className={classes.button} onClick={(e) => handleSubmit(e)}>Continue</Button>
                </CardActions>
            </Card>
        </Grid>
        
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth className={`${classes.selectModal} ${classes.root}`}>
            <DialogTitle>Category for {refList[dialogId]}</DialogTitle>
            <DialogContent className={classes.alignCenter}>
                <DialogContentText>Select from dropdown</DialogContentText>
                <div className={classes.alignCenter}>
                {
                    displayCols.map((col, idx) => {
                        if (idx>0) {
                            if (idx === 1 || selectedVals[idx-1] !== undefined) {
                                return (
                                    <FormControl key={`form${idx}`} className={classes.form}>
                                        <InputLabel shrink>{col}</InputLabel>
                                        <Select value={!selectedVals[idx] ? '' : selectedVals[idx]} onChange={(e)=>handleSelectInput(e, idx)}>
                                            <option value="">Select</option>
                                            {
                                                currentOptions[idx].map((el, index) => <option key={`opt${index}`}value={el}>{el}</option>)
                                            }
                                        </Select>
                                    </FormControl>
                                )
                            }                             
                            else {
                                return (
                                    <FormControl key={`form${idx}`} disabled className={classes.form}>
                                        <InputLabel shrink>{col}</InputLabel>
                                        <Select value='' onChange={(e)=>handleSelectInput(e, idx)}>
                                            <option value="">Select previous first</option>
                                        </Select>
                                    </FormControl>
                                )
                            } 
                            // else {
                            //     return (
                            //         <FormControl key={`form${idx}`} className={classes.form}>
                            //             <InputLabel shrink>{col}</InputLabel>
                            //             <Select value={!selectedVals[idx] ? '' : selectedVals[idx]} onChange={(e)=>handleSelectInput(e, idx)}>
                            //                 <option value="">Select</option>
                            //                 {
                            //                     // result['orderedCats'][idx]['values'].filter((item, i) => result['orderedCats'][idx-1]['values'][i] === selectedVals[idx-1]).map((el, index) => <option key={`opt${index}`} value={el}>{el}</option>)
                            //                 }
                            //             </Select>
                            //         </FormControl>
                            //     )
                            // }
                        }
                    })
                }
                </div> 
                <Card className={`${classes.foundCat} ${classes.alignCenter}`}>
                    {
                        (cat) ? <><Typography>Found Category: {cat}</Typography><Button onClick={handleInput} className={classes.button}>Select</Button></> : ''
                    }
                </Card>               
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)} className={classes.backButton}>Cancel</Button>                
            </DialogActions>
        </Dialog>
        <Dialog open={catDefOpen} onClose={() => setCatDefOpen(false)} className={`${classes.catdefModal} ${classes.root}`} maxWidth={false}>
            <DialogTitle>Category Definitions</DialogTitle>
            <DialogContent>
                <TableContainer className={classes.container}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                {
                                    result['colList'].map((col, idx) => {
                                        if (idx>0) {
                                            return (
                                                <TableCell key={idx} align='center' className={`${classes.header} ${classes.cell}`}>
                                                    {col}
                                                </TableCell>
                                            )
                                        }
                                    })
                                }
                            </TableRow>
                        </TableHead>
                        <TableBody className={classes.header}>
                            {
                                result['allCats'].map((cat, idx) => 
                                <TableRow hover key={idx}>
                                    {
                                        cat.map((row, i) => {
                                            if(i>0) {
                                                return (
                                                <TableCell key={`col${i}`} align='center' className={classes.cell}>
                                                    {row}
                                                </TableCell>
                                                )}
                                        })
                                    }
                                </TableRow>)
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setCatDefOpen(false)} className={classes.button}>Close</Button>
            </DialogActions>
        </Dialog>

        </>
        
    )
}

export default Categories;