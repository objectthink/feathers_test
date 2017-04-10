import React, { Component } from 'react';
//import { Input, List } from 'semantic-ui-react'
import { List, Button, Card, Image } from 'semantic-ui-react'
import { socketApp } from '../store';
import InstrumentImage from './instrument.png'
import Main from './Main'

class Home extends Component {

  constructor(props) {
    super(props);

    this.props.findAllItems();

    this.state = {
      text: ''
    }

    this.listItem = this.listItem.bind(this);
    this.onClickReset = this.onClickReset.bind(this);
  }

//  <div class="summary">
//     <a>{item.runState}</a>
//  </div>

//  <div className="description">
//    {item.runState}
//  </div>

  //////CARDS//////////////////////////////////////////////////////////////////
  listCardItem(item) {
    return (

      <div className="card" key={item.mac}>
        <div className="content">
          <div className="header">{item.serialnumber}</div>
          <div className="description">
            {item.location}
          </div>
          <div className="description">
            {item.mac}
          </div>
          <div className="summary">
             <a>{item.runState}</a>
          </div>
        </div>
        <div className="ui bottom attached button">
          <i className="info icon"></i>
            More...
        </div>
      </div>
    );
  }

  onClickReset()
  {
    console.log('onClickReset');

    var itemService = socketApp.service('/items');

    itemService.find({reset:'true'});

    this.setState({text: ''});
  }

  //<button className="ui button" onClick={this.onClickReset}>
  //  Reset
  //</button>

  renderCardsList()
  {
    try {

      //console.log(this.props);
      //console.log(this.props.items);
      console.log(this.props.items.all);

      return (
        <div>
          <div className="ui cards">
          {this.props.items.all.map(this.listCardItem)}
          </div>
        </div>
      );
    }
    catch (e)
    {

      console.log(e);
    }
    finally
    {
    }

  }
  /////////////////////////////////////////////////////////////////////////////

  //////FIRST//////////////////////////////////////////////////////////////////
  listItem(item) {
    return (

      <div key={item.mac} className="item">
        <i className="large github middle aligned icon"></i>
        <div className="content">
          <a className="header">{item.mac}</a>
          <div className="description">{item.serialnumber}</div>
          <div className="description">{item.location}</div>
        </div>
      </div>

    );
  }

  renderList() {
    try {

      //console.log(this.props);
      //console.log(this.props.items);
      console.log(this.props.items.all);

      return (
        <div className="ui relaxed divided list">
          {this.props.items.all.map(this.listItem)}
        </div>
      );

    }
    catch (e) {

      console.log(e);
    }
    finally {
    }

  }
 /////////////////////////////////////////////////////////////////////////////

 //SEMANTIC UI REACT CARDS list
 listReactCardItem(item) {
   return (

     <Card key={item.mac}>
       <Card.Content>
         <Image floated='right' size='mini' src={InstrumentImage} />
         <Card.Header>
           {item.serialnumber}
         </Card.Header>

         <Card.Description>
           {item.location}
         </Card.Description>

         <Card.Description>
           {item.mac}
         </Card.Description>

         <Card.Meta>
            <a>{item.runState}</a>
         </Card.Meta>

       </Card.Content>

       <div className="ui bottom attached button">
         <i className="info icon"></i>
           More...
       </div>

     </Card>
   );
 }

 renderReactCardsList()
 {
   try {

     //console.log(this.props);
     //console.log(this.props.items);
     console.log(this.props.items.all);

     return (
       <Card.Group>
         {this.props.items.all.map(this.listReactCardItem)}
       </Card.Group>
     );
   }
   catch (e)
   {

     console.log(e);
   }
   finally
   {
   }

 }
 /////////////////////////////////////////////////////////////////////////////

 render() {
   try {

     //console.log(this.props);
     //console.log(this.props.items);

     console.log(this.props.items.all);

     console.log(this.props.activeItem)

     return this.renderReactCardsList();

     //if(this.props.activeItem === 'cardview')
     //{
    //  return this.renderCardsList();
     //}
     //else
     //{
    //   return this.renderList();
     //}

   }
   catch (e) {

     console.log(e);
   }
   finally {
   }

 }

}

export default Home;
