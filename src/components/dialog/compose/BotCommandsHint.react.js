/*
 * Copyright (C) 2015-2016 Actor LLC. <https://actor.im>
 */

import React, { PropTypes, Component } from 'react';
import EventListener from 'fbjs/lib/EventListener';
import { findDOMNode } from 'react-dom';
import classnames from 'classnames';
import { shouldComponentUpdate } from 'react-addons-pure-render-mixin';

import { KeyCodes } from '../../../constants/ActorAppConstants';

const DROPDOWN_ITEM_HEIGHT = 38;
let scrollIndex = 0;

class BotCommandsHint extends Component {
  static propTypes = {
    commands: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      selectedIndex: 0
    };

    this.scrollTo = this.scrollTo.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
  }

  componentWillUnmount() {
    this.cleanListeners();
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.isOpen && !this.state.isOpen) {
      this.setListeners();
    } else if (!nextState.isOpen && this.state.isOpen) {
      this.cleanListeners();
    }
  }

  componentWillReceiveProps(props) {
    const { commands } = props;
    this.setState({
      isOpen: commands && commands.length > 0,
      selectedIndex: 0
    });
  }

  setListeners() {
    this.cleanListeners();
    this.listeners = [
      EventListener.listen(document, 'keydown', this.onKeyDown),
      EventListener.listen(document, 'click', this.props.onClose)
    ];
  }

  cleanListeners() {
    if (this.listeners) {
      this.listeners.forEach((listener) => {
        listener.remove();
      });

      this.listeners = null;
    }
  }

  scrollTo(top) {
    const menuListNode = findDOMNode(this.refs.mentionList);
    menuListNode.scrollTop = top;
  }

  onKeyDown(event) {
    const { commands } = this.props;
    const { selectedIndex } = this.state;
    const visibleItems = 3;
    let index = selectedIndex;

    if (event.keyCode === KeyCodes.ESC) {
      this.props.onClose();
    }

    if (index !== null) {
      switch (event.keyCode) {
        case KeyCodes.ENTER:
          event.stopPropagation();
          event.preventDefault();
          this.props.onSelect(commands[selectedIndex]);
          break;

        case KeyCodes.ARROW_UP:
          event.stopPropagation();
          event.preventDefault();

          if (index > 0) {
            index -= 1;
          } else if (index === 0) {
            index = commands.length - 1;
          }

          if (scrollIndex > index) {
            scrollIndex = index;
          } else if (index === commands.length - 1) {
            scrollIndex = commands.length - visibleItems;
          }

          this.scrollTo(scrollIndex * DROPDOWN_ITEM_HEIGHT);
          this.setState({ selectedIndex: index });
          break;
        case KeyCodes.ARROW_DOWN:
        case KeyCodes.TAB:
          event.stopPropagation();
          event.preventDefault();

          if (index < commands.length - 1) {
            index += 1;
          } else if (index === commands.length - 1) {
            index = 0;
          }

          if (index + 1 > scrollIndex + visibleItems) {
            scrollIndex = index + 1 - visibleItems;
          } else if (index === 0) {
            scrollIndex = 0;
          }

          this.scrollTo(scrollIndex * DROPDOWN_ITEM_HEIGHT);
          this.setState({ selectedIndex: index });
          break;
        default:
      }
    }
  }

  renderCommands() {
    const { selectedIndex } = this.state;

    return this.props.commands.map(({ command, description }, index) => {
      const className = classnames('mention__list__item', {
        'mention__list__item--active': selectedIndex === index
      });

      return (
        <li
          key={command}
          className={className}
          onClick={() => this.props.onSelect(command)}
          onMouseOver={() => this.setState({ selectedIndex: index })}
        >
          <div className="title">
            <span className="nickname">{`/${command}`}</span>
            <span className="name">{description}</span>
          </div>
        </li>
      );
    });
  }

  render() {
    return (
      <div className="mention mention--opened">
        <div className="mention__wrapper">
          <header className="mention__header">
            <div className="pull-left"><strong>tab</strong>&nbsp; or &nbsp;<strong>↑</strong><strong>↓</strong>&nbsp; to navigate</div>
            <div className="pull-left"><strong>↵</strong>&nbsp; to select</div>
            <div className="pull-right"><strong>esc</strong>&nbsp; to close</div>
          </header>
          <ul className="mention__list" ref="mentionList">
            {this.renderCommands()}
          </ul>
        </div>
      </div>
    );
  }
}

export default BotCommandsHint;
