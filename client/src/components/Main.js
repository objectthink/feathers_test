import React, { Component } from 'react';
import { Header, Container, Menu, Select, Button, Modal} from 'semantic-ui-react'
import { socketApp } from '../store';

class Main extends Component {

  constructor(props) {
    super(props);

    this.state = {

    }

    this.onClickMenu = this.onClickMenu.bind(this);
  }

  componentWillMount() {
    const itemService = socketApp.service('/items');
    itemService.on('created', (item) => this.props.createdItem(item));
    itemService.on('updated', (item) => this.props.updatedItem(item));
    itemService.on('removed', (item) => this.props.removedItem(item));
  }

//  onClickMenu = (e, { name }) => {
//    console.log('menu clicked!')
//    this.setState({ activeItem: name })
//  }

  onClickMenu(e, { name }) {
    console.log('menu clicked!')
    this.setState({ activeItem: name })

    if(name === 'about'){
      alert('about!');
    }
    else {
      this.props.routes[1].component.prototype.menuSelection({menuSelection: name});
    }
  }

  render() {

    const { activeItem } = this.state

    return (
      <Container>

        <Menu>
            <Menu.Item
              name="about"
              active={activeItem === 'about'}
              onClick={this.onClickMenu}
            >
            About
          </Menu.Item>

          <Menu.Item
            name="cardview"
            active={activeItem === 'cardview'}
            onClick={this.onClickMenu}
          >
          Card View
          </Menu.Item>

          <Menu.Item
            name="listview"
            active={activeItem === 'listview'}
            onClick={this.onClickMenu}
            >
            List View
          </Menu.Item>

          <Menu.Item
            name="search"
            active={activeItem === 'search'}
            onClick={this.onClickMenu}
            >
            Search
          </Menu.Item>

          <Menu.Item
            name="scripts"
            active={activeItem === 'scripts'}
            onClick={this.onClickMenu}
            >
            Scripts
          </Menu.Item>

          <Select placeholder='Instrument Type...' options={[
            {text:'ALL', value:'ALL'},
            {text:'DSC', value:'DSC'},
            {text:'SDT', value:'SDT'}
            ]} />

        </Menu>

        <Header as="h1" textAlign="center">
          Mercury Instrument Manager
        </Header>

        {React.cloneElement(this.props.children, this.props)}
      </Container>
    )
  }
}

export default Main;
