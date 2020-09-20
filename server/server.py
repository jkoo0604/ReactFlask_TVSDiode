from flask import Flask, request, redirect
from logicfunc import calculate, loadCatDef

app = Flask(__name__)

@app.route('/test')
def index():
    return {'test': 'testing flask with react'}

@app.route('/getcatdef')
def getCatDef():
    return loadCatDef()

@app.route('/getresults', methods=['POST'])
def getResults():
    data = request.json
    print(data)
    if ('ref_ids' not in data) | ('categories' not in data) | (type(data['ref_ids']) is not list) | (type(data['categories']) is not list) | ((len(data['ref_ids']) > 0) & (len(data['ref_ids']) != len(data['categories']))):
    # if ('ref_ids' not in data) | ('categories' not in data) | (!isinstance(data['ref_ids'], list)) | (!isinstance(data['categories'], list) is not list | (len(data['ref_ids']) > 0 & len(data['ref_ids']) != len(data['categories']))):
        return {'result_status': 'Failure', 'message': 'Invalid input'}
    # input = {'ref_id': data['ref_ids'], 'categories': data['categories']}
    return calculate(data)


if __name__=="__main__":
    app.run(debug=True)

