import React, { Component } from 'react';
//import { Input, List } from 'semantic-ui-react'
import { List, Button, Card, Image, Header, Container, Label, Icon, Item } from 'semantic-ui-react'
import { socketApp } from '../store';
import DSCImage from './dsc.png'
import SDTImage from './sdt.png'
import TGAImage from './tga.png'
import TRIOSImage from './trios.png'
import Main from './Main'

class Home extends Component {

  constructor(props) {
    super(props);

    this.props.findAllItems();

    this.state = {
      text: '',
      selectedItem: 'NONE'
    }

    this.listItem = this.listItem.bind(this);
    this.onClickReset = this.onClickReset.bind(this);
    this.listReactCardItem = this.listReactCardItem.bind(this);

    //this.onClickMore = this.onClickMore.bind(this);
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

 onClickMore = () => {

 }

 //<Card.Meta>
 //  <a>{item.runState}</a>
 //</Card.Meta>

 //SEMANTIC UI REACT CARDS list
 listReactCardItem(item) {

   console.log(item.runState);

   var labelColor = 'red';

   if(item.runState === 'Idle'){
     labelColor = 'green';
   }

   if(item.runState === 'Pretest'){
     labelColor = 'yellow';
   }

   if(item.runState === 'Post Test'){
     labelColor = 'yellow';
   }

   var instrumentImage = SDTImage;

   if(item.instrumentType === "DSC")
   {
     instrumentImage = DSCImage;
   }

   if(item.instrumentType === "TGA")
   {
     instrumentImage = TGAImage;
   }

   if(item.instrumentType === "TRIOS")
   {
     instrumentImage = TRIOSImage;
   }

   return (

     <Card key={item.mac} >
       <Card.Content>
         <Image floated='right' size='tiny' src={instrumentImage} />
         <Card.Header>
           {item.serialnumber} ({item.mac})
         </Card.Header>

         <Card.Description>
           {item.model}
         </Card.Description>

         <Card.Description>
           {item.location}
         </Card.Description>

         <Label color={labelColor}>
            {item.runState}
         </Label>

       </Card.Content>

       <Button onClick={ ()=>
           {
              console.log('click! ' + item.mac)
              this.setState({selectedItem: item})
           }
         }>
         <i className="info icon" ></i>
           More...
       </Button>


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

// <Header>
//   {this.state.selectedItem.serialnumber}
// </Header>
  //instrument page
 renderInstrumentPage()
 {
    return (
      <Container>

        <Header as='h1' icon textAlign='center'>
          <Image centered size='small' src={DSCImage} />
          <Header.Content>
            {this.state.selectedItem.serialnumber}
          </Header.Content>
          <Header.Content as='h3'>
            {this.state.selectedItem.model}
          </Header.Content>
          <Header.Content as='h3'>
            {this.state.selectedItem.location}
          </Header.Content>

        </Header>

        <Button content='Back' icon='chevron left' labelPosition='left' onClick= {()=>
            {
               console.log('click! ')
               this.setState({selectedItem: 'NONE'})
            }
          }>
        </Button>

        <Button content='Stop' icon='stop' labelPosition='left' />
        <Button content='Start' icon='play' labelPosition='left' />
        <Button content='Next Segment' icon='right arrow' labelPosition='right' />

      </Container>
    );
 }

 renderInstrumentPageEx()
 {
   var labelColor = 'red';

   if(this.state.selectedItem.runState === 'Idle'){
     labelColor = 'green';
   }

   if(this.state.selectedItem.runState === 'Pretest'){
     labelColor = 'yellow';
   }

   if(this.state.selectedItem.runState === 'Post Test'){
     labelColor = 'yellow';
   }

   var instrumentImage = SDTImage;

   if(this.state.selectedItem.instrumentType === "DSC")
   {
     instrumentImage = DSCImage;
   }

   if(this.state.selectedItem.instrumentType === "TGA")
   {
     instrumentImage = TGAImage;
   }

   if(this.state.selectedItem.instrumentType === "TRIOS")
   {
     instrumentImage = TRIOSImage;
   }

    return (
      <Container>

        <Item.Group>
          <Item>
            <Item.Image size='tiny' src={instrumentImage} />

            <Item.Content>
              <Item.Header as='a'>{this.state.selectedItem.serialnumber}</Item.Header>
              <Item.Meta>{this.state.selectedItem.model}</Item.Meta>
              <Item.Description>
                {this.state.selectedItem.location}
              </Item.Description>
              <Item.Extra>({this.state.selectedItem.mac})</Item.Extra>

                <Label color={labelColor}>
                   {this.state.selectedItem.runState}
                </Label>

            </Item.Content>
          </Item>

        </Item.Group>


        <Button content='Back' icon='chevron left' labelPosition='left' onClick= {()=>
            {
               console.log('click! ')
               this.setState({selectedItem: 'NONE'})
            }
          }>
        </Button>

        <Button content='Stop' icon='stop' labelPosition='left' />
        <Button content='Start' icon='play' labelPosition='left' />
        <Button content='Next Segment' icon='right arrow' labelPosition='right' />

      </Container>
    );
 }


 ////////////////////////////////////////////////////////////////////////////

 render() {
   try {

     //console.log(this.props);
     //console.log(this.props.items);
     //console.log(this.props.items.all);
     //console.log(this.props.activeItem)

     console.log('render called!');
     console.log(this.state.selectedItem);

     if(this.state.selectedItem !== 'NONE'){

       var itemService = socketApp.service('/items');
       itemService.get(this.state.selectedItem.mac).then(
         answer => {
           console.log('called get:');
           console.log(answer);

           //probably not the best way to do this
           //still poking around with react and js
           if(answer.runState !== this.state.selectedItem.runState)
           {
             this.setState({selectedItem: answer});
           }
         });

       return this.renderInstrumentPageEx();
     }
     else {
       return this.renderReactCardsList();
     }

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
