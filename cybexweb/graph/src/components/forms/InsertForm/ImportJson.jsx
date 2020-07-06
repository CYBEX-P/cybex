
import React, {useContext} from 'react';
import axios from 'axios';
import DataContext from '../../App/DataContext';


const ImportJson = props => {
    const {  setNeo4jData } = useContext(DataContext);
   // const { dispatchModal, setError } = useContext(ModalContext);
    //const { setLoading } = useContext(MenuContext);
    

   function onChange(e)
    {
        const data = new FormData()
        data.append('file', e.target.files[0])
        axios
        .post('/import_json', data,{   
        })
        .then(res => {
            console.log(res.data)
            setNeo4jData(res.data)
        })
    
    }
    return(
        <div style={{backgroundColor: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "5px",minHeight: "90px"}}>
        <form >
            <label>Import JSON</label>
            <input type ="file" name="file" onChange={onChange}/> 
          
       </form>
        </div> 
    )
}
export default ImportJson;
  
