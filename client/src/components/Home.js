import React, { Component } from 'react';
import { Input, List, Menu, Icon } from 'semantic-ui-react'
import { Button, Card, Image, Header, Container, Label, Item, Message, Table} from 'semantic-ui-react'
import { socketApp } from '../store';
import DSCImage from './dsc.png'
import SDTImage from './sdt.png'
import TGAImage from './tga.png'
import TRIOSImage from './trios.png'

var signalCount = 0
var signalLimit = 7
class Home extends Component {

  constructor(props) {
    super(props);

    this.props.findAllItems();

    this.state = {
      selectedItem: 'NONE',
      menuSelection: 'NONE'
    }

    this.listItem = this.listItem.bind(this);
    this.listReactCardItem = this.listReactCardItem.bind(this);
    this.menuSelection = this.menuSelection.bind(this);

    this.selectedItem = {}

    this.signalLimit = 7
    this.signalCount = 0

    this.tableType = 'realtimesignals'

    this.page = 'MAIN'

    console.log('constructed');
  }

  getDefaultsProps()
  {
    console.log('getDefaultsProps');
  }

  componentWillMount()
  {
    console.log('componentWillMount');
  }

  componentDidMount()
  {
    console.log('componentDidMount');
  }

  menuSelection(args){
    console.log('called me: ' + args.menuSelection);
    //this.setState({menuSelection: ''});
  }

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

     <Card key={item.mac} color='orange'>
       <Card.Content>
         <Image floated='right' size='tiny' src={instrumentImage} />
         <Card.Header>
           {item.name}
         </Card.Header>

         <Card.Header>
           {item.model}
         </Card.Header>

         <Card.Meta>
          {item.serialnumber}
         </Card.Meta>

         <Card.Meta>
          ({item.mac})
         </Card.Meta>

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
              this.page = 'INFO'
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

        <Button content='Back' icon='chevron left' labelPosition='left' onClick={()=>
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

 realtimeSignalItem(signal)
 {
    if(signalCount == signalLimit)
    {
      return (null);
    }
    else
    {
      signalCount += 1

      return (
        <Table.Row key={signal._name}>
          <Table.Cell>{signal._name}</Table.Cell>
          <Table.Cell>{signal._value}</Table.Cell>
        </Table.Row>
      );
    }
 }

 syslogItem()
 {
   var syslogService = socketApp.service('/instrumentMessages');
   syslogService.find().then((data)=>{
     console.log(data)
   })
 }

 populateTable()
 {
 }

 renderInstrumentPageEx()
 {
   var labelColor = 'grey';

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

   signalCount = 0

   var signals = []
   signals = this.state.selectedItem.realtimesignalsstatus

   //this.state.selectedItem.realtimesignalsstatus.map((item, index)=>{
   ///  console.log(item)
   //})

    return (
      <Container>

        <Item.Group>
          <Item>
            <Item.Image size='tiny' src={instrumentImage} />

            <Item.Content>
              <Item.Header as='a'>{this.state.selectedItem.name}</Item.Header>
              <Item.Meta>{this.state.selectedItem.model}</Item.Meta>
              <Item.Meta>{this.state.selectedItem.serialnumber}</Item.Meta>
              <Item.Description>
                {this.state.selectedItem.location}
              </Item.Description>

                <Label color={labelColor}>
                   {this.state.selectedItem.runState}
                </Label>

            </Item.Content>
          </Item>

        </Item.Group>

        <Message>
          <Message.Header>
            Real time signals, experiments, and syslog
          </Message.Header>
        </Message>

        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Value</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
          </Table.Body>
            {signals.map(this.realtimeSignalItem)}
          <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan='3'>
              <Menu floated='right' pagination>
                <Menu.Item as='a' icon>
                  <Icon name='left chevron' />
                </Menu.Item>
                <Menu.Item as='a'>1</Menu.Item>
                <Menu.Item as='a'>2</Menu.Item>
                <Menu.Item as='a'>3</Menu.Item>
                <Menu.Item as='a'>4</Menu.Item>
                <Menu.Item as='a' icon>
                  <Icon name='right chevron' />
                </Menu.Item>
              </Menu>
            </Table.HeaderCell>
          </Table.Row>
          </Table.Footer>
        </Table>

        <Button content='Back' icon='chevron left' labelPosition='left' onClick={()=>
            {
               console.log('click! ')
               this.page = 'MAIN'
               this.setState({selectedItem: 'NONE'})
            }
          }>
        </Button>

        <Button content='Change Location' icon='marker' labelPosition='left' onClick={()=>
            {
              var newLocation = prompt("new location", "some location");

              this.state.selectedItem.location = newLocation;//"NEW LOCATION";

              var itemService = socketApp.service('/items');
              itemService.update(
                this.state.selectedItem.mac,
                this.state.selectedItem,
                {query: {sendToInstrument: 'true', which: 'location'}});

                this.setState({selectedItem: this.state.selectedItem});
            }
          }>
        </Button>

        <Button content='Stop' icon='stop' labelPosition='left' onClick={()=>
          {
              console.log('stop clicked!');

              var itemService = socketApp.service('/items');
              itemService.update(
                this.state.selectedItem.mac,
                this.state.selectedItem,
                {query: {command: 'stop', with: ''}});
          }
        }/>

        <Button content='Start' icon='play' labelPosition='left' onClick={()=>
          {
              console.log('start clicked!');

              var itemService = socketApp.service('/items');
              itemService.update(
                this.state.selectedItem.mac,
                this.state.selectedItem,
                {query: {command: 'start', with: ''}});
          }
        }/>

        <Button content='Control' icon='settings' labelPosition='left' onClick={()=>
            {
              console.log('control clicked!');
              //var itemService = socketApp.service('/items');
              //itemService.find({query: {name: 'value'}});
            }
          }>
        </Button>
        <Button content='Experiments' icon='line chart' labelPosition='left' onClick={()=>
            {
              console.log('experiments clicked!');
              //var itemService = socketApp.service('/items');
              //itemService.find({query: {name: 'value'}});
            }
          }>
        </Button>

        <Button content='Syslog' icon='file text outline' labelPosition='left' onClick={()=>
            {
              console.log('syslog clicked!');
              //var itemService = socketApp.service('/items');
              //itemService.find({query: {name: 'value'}});
              this.syslogItem()
            }
          }>
        </Button>

      </Container>
    );
 }


 ////////////////////////////////////////////////////////////////////////////

 render() {
   try {

     console.log('render called!');
     console.log(this.state.selectedItem);
     console.log(this.page)

     //if(this.state.selectedItem !== 'NONE'){
     if(this.page !== 'MAIN'){
       var itemService = socketApp.service('/items');
       itemService.get(this.state.selectedItem.mac).then(
         answer =>
         {
           console.log('called get:' + answer.runState);
           console.log(answer);

           this.selectedItem = answer
           this.state.selectedItem = answer;

           this.setState({selectedItem: answer});

           //probably not the best way to do this
           //still poking around with react and js
           //if(answer.runState !== this.state.selectedItem.runState)
           //{
           //  this.setState({selectedItem: answer});
           //}

         });

       return this.renderInstrumentPageEx();
     }
     else
     {
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
