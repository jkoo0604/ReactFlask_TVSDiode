import React, { useState, useEffect } from 'react';
import { Button, Accordion, AccordionSummary, AccordionDetails, Divider, Menu, MenuItem, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { GetApp, ExpandMoreRounded } from '@material-ui/icons';
import { navigate } from '@reach/router';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CSVLink } from "react-csv";

import colors from '../config/colors';
import MyPaper from '../components/MyPaper';
import MyTable from '../components/MyTable';

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
        width: '80%',
        alignContent: 'center',
        backgroundColor: colors.darkBackgroundCard,
    },
    container: {
        maxHeight: 440,
        marginTop: 20
    },
    header: {
        backgroundColor: colors.darkBackground
    },
    cell: {
        color: colors.darkNeutral100,
        borderBottom: 'solid',
        borderBottomWidth: 0.5,
        borderBottomColor: colors.darkNeutral40,
    },
    resultDiv: {

    },
    divider: {
        marginTop: 30,
        marginBottom: 30,
        backgroundColor: colors.darkNeutral60
    }
}));

const Results = props => {
    const classes = useStyles();
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [finalResult, setFinalResult] = useState({});
    const [anchorEl, setAnchorEl] = useState(null);
    const [csvData, setCsvData] = useState([]);
    const [pdfData, setPdfData] = useState({});
    const [catCsv, setCatCsv] = useState([]);
    const {reqBody, cats, reqType} = props.location.state;


    useEffect(() => {

        fetch('/getresults', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(reqBody)}).then(r => r.json()).then(res => {
            let queryResult = {};
            if (res['result_status'] === 'Failure') {
                setError(true);
                setLoading(false);
                return;
            } else {
                queryResult = {'message': 'all results', 'data': res['results_data'], 'output': res['output_data']};
            };
            console.log(queryResult);

            // prepare data for csv conversion
            let data = queryResult['data']['results'];
            let pdfData = queryResult['output']['results'];
            let refs = queryResult['data']['ref_id'];
            let catList = queryResult['data']['cat_id'];
            let columns = [];
            let pdfPrep = {};
            
            for (let i=0; i<catList.length; i++) {
                if (data[i] !== '' && !columns.length) {
                    if (reqType === 'Select') {
                        columns = ['Reference Designator'].concat(data[i]['columns']);
                    } else {
                        columns = data[i]['columns'];
                    };
                    pdfPrep['head'] = [pdfData[i]['columns']];
                    break;
                };
            };

            if (!columns.length) {             
                setFinalResult(queryResult);
                setLoading(false);
                return;
            };

            let rows = [columns];
            for (let i=0; i<catList.length; i++) {
                if (data[i] === '') continue;                
                if (data[i]['data'].length) {
                    for (let j=0; j<data[i]['data'].length; j++) {
                        if (reqType === 'Select') data[i]['data'][j].unshift(refs[i]);
                        rows.push(data[i]['data'][j]);
                    };
                };
            };
            setCsvData(rows);

            // prepare data for pdf conversion
            let pdfRows = [];
            let pdfText = [];
            for (let i=0; i<catList.length; i++) {
                if (pdfData[i] === '') continue;
                pdfRows.push([]);
                if (pdfData[i]['data'].length) {
                    for (let j=0; j<pdfData[i]['data'].length; j++) {
                        pdfRows[i].push(pdfData[i]['data'][j]);
                    };
                };
                pdfText.push('Results for ' + (reqType === 'Select' ? refs[i] : 'Category ' + catList[i]));
            };
            pdfPrep['body'] = pdfRows;
            pdfPrep['text'] = pdfText;
            setPdfData(pdfPrep);

            // cat def csv
            let catDef = cats['allCats'];
            let catRows = [...cats['colList']];
            for (let i=0; i<catDef.length; i++) {
                let tempRow = [...catDef[i]];
                catRows.push(tempRow);
            };
            setCatCsv(catRows);

            setFinalResult(queryResult);
            setLoading(false);
        })
        .catch(error => {
            console.log(error);
        });        
    }, []);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    
    const handlePDF = () => {
        handleClose();
        let doc = new jsPDF();
        let finalY = doc.lastAutoTable.finalY || 10;
        let len = queryResult['data']['ref_id'].length;

        for (let i=0; i<len; i++) {
            doc.text(pdfData['text'][i], 14, finalY + 15);
            doc.autoTable({
                startY: finalY + 20,
                head: pdfData['head'],
                body: pdfData['body'][i],
                pageBreak: 'avoid'
            });    
            finalY = doc.lastAutoTable.finalY;        
        };
        doc.save('result.pdf');
    };

    const handleBack = () => {
        navigate('/', {replace: true});
    };

    return (
        loading===true ? <p>{loading}</p> :
        <>      
        <div className={classes.root}>
            <MyPaper>
                <h2 className={classes.title}>TVS-Diode Selection Tool</h2>
                <p className={classes.subtext}>Enter information below</p>
                <p className={classes.error}>
                    {
                        inputError !== '' ? errors[inputError] : ''
                    }
                </p>
            </MyPaper>
        </div>
        <Grid container align='center' className={classes.root}>
            <Card className={classes.card}>
                <CardActions className={classes.alignBetween}>
                    <Button size="small" className={classes.backButton} onClick={handleBack}>Reset</Button>
                    <IconButton className={classes.button} onClick={handleClick}><GetApp /></IconButton>
                    <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                        <MenuItem onClick={handlePDF} disabled={Object.keys(pdfData).length === 0}>Download result in PDF</MenuItem>
                        <MenuItem disabled={csvData.length === 0}><CSVLink data={csvData} filename={"result.csv"} onClick={handleClose}>Download full data in CSV</CSVLink></MenuItem>
                        <MenuItem disabled={catCsv.length === 0}><CSVLink data={catCsv} filename={"catdef.csv"} onClick={handleClose}>Download category definitions in CSV</CSVLink></MenuItem>
                    </Menu>
                </CardActions>
                <CardContent>
                    <Typography className={classes.title} gutterBottom variant="h4">
                        Result
                    </Typography>
                    <Typography className={classes.error} variant="subtitle2">
                        { error ? 'No result to display' : '' }
                    </Typography>
                    {/* <Paper className={classes.paper} elevation={5}> */}
                        {
                            queryResult['data']['ref_id'].map((ref, idx) => (
                                <div key={ref} className={classes.resultDiv}>
                                    <Typography className={classes.subtext} variant='h6'>{ref}</Typography>
                                    <Accordion>
                                        <AccordionSummary expandIcon={<ExpandMoreRounded />}>
                                            Category {queryResult['data']['cat_id'][idx]}
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <TableContainer className={classes.container}>
                                                <Table stickyHeader>
                                                    <TableHead>
                                                        <TableRow>
                                                            {
                                                                colList.map((col, i) => {
                                                                    if (i>0) {
                                                                        return (
                                                                            <TableCell key={i} align='center' className={`${classes.header} ${classes.cell}`}>
                                                                                {col}
                                                                            </TableCell>
                                                                        )
                                                                    }
                                                                })
                                                            }
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody className={classes.header}>
                                                        <TableRow>
                                                            {
                                                                catDef[queryResult['data']['cat_id'][idx]-1].map((row, i) => {
                                                                    if(i>0) {
                                                                        return (
                                                                        <TableCell key={`col${i}`} align='center' className={classes.cell}>
                                                                            {row}
                                                                        </TableCell>
                                                                        )}
                                                                })
                                                            }
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </AccordionDetails>
                                    </Accordion>
                                    {
                                        queryResult['output']['results'][idx]['data'].length === 0 ? <Typography>No component found</Typography> : 
                                        <TableContainer className={classes.container}>
                                            <Table stickyHeader>
                                                <TableHead>
                                                    <TableRow>
                                                        {
                                                            queryResult['output']['results'][idx]['columns'].map((col, i) => {
                                                                return (
                                                                    <TableCell key={i} align='center' className={`${classes.header} ${classes.cell}`}>
                                                                        {col}
                                                                    </TableCell>
                                                                )
                                                            })
                                                        }
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody className={classes.header}>
                                                    {
                                                        queryResult['output']['results'][idx]['data'].map((row, i) => 
                                                        <TableRow hover key={i}>
                                                            {
                                                                queryResult['output']['results'][idx]['data'][i].map((cell, index) => {
                                                                    return (
                                                                    <TableCell key={`col${index}`} align='center' className={classes.cell}>
                                                                        {cell}
                                                                    </TableCell>
                                                                    )
                                                                })
                                                            }
                                                        </TableRow>)
                                                    }
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    }
                                    <Divider light classes={{root: classes.divider}}/>
                                </div>
                            ))
                        }
                    {/* </Paper> */}
                </CardContent>
                <CardActions className={classes.alignRight}>
                </CardActions>
            </Card>
        </Grid>
        </>
        
    )
}

export default Results;