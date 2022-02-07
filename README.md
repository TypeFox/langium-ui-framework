<div id="logo" align="center">
  <a href="https://github.com/TypeFox/langium-ui-framework">
		<img alt="Langium Logo" width="800" src="https://user-images.githubusercontent.com/68400102/150516517-7da9423e-7d0e-4605-91c7-d7693ccd3c28.png">
  </a>
  <h3>
      A DSL for generating user interfaces, built with
  </h3>
  <a href="https://github.com/langium/langium">
		<img alt="Langium Logo" width="256" src="https://user-images.githubusercontent.com/4377073/135283991-90ef7724-649d-440a-8720-df13c23bda82.png">
  </a>
</div>
<br>
<div id="badges" align="center">
	
   [![Build status](https://github.com/TypeFox/langium-ui-framework/actions/workflows/build.yml/badge.svg)](https://github.com/TypeFox/langium-ui-framework/actions/workflows/build.yml)
	  [![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/TypeFox/langium-ui-framework)

</div>

<hr>
SimpleUI is a easy UI Framework for building and generating web user interfaces. SimpleUI includes HTML, JavaScript and CSS.

## Getting started
- Clone the repository using `git clone https://github.com/TypeFox/langium-ui-framework.git`
- `npm i` to install all required dependencies
- `npm i -g` to install it globally
- `npm run langium:generate && npm run build` to generate the infrastructure and build the project

To run booth watchers use `npm run watch && npm run langium:watch`.

## Example
Generate your code using
- `simple-ui-cli.cmd generate <filename>` on Windows
- `simple-ui-cli generate <filename>` on MacOS

add `-w` or `--watch` to run watcher.

### Code
```ruby
div classes[flex-container, center] {
    div classes[border, border--hidden, shadow]{
        heading "Hello World" level: 4
        paragraph 
        "
        Lorem ipsum dolor sit amet, 
        consetetur sadipscing elitr, 
        sed diam nonumy eirmod tempor invidunt ut labore, 
        et dolore magna aliquyam
        "
        { width: "50%" }
    }
}
```
### Result
HTML (Formatted)
```html
<div class='border border--hidden shadow' >
    <h4 >Hello World</h4>
    <p style='width:50%; '>
        <br>Lorem ipsum dolor sit amet, <br>consetetur sadipscing elitr, 
        <br>sed diam nonumy eirmod tempor invidunt ut labore, <br>et dolore magna aliquyam<br>
    </p>
</div>
```
**Image**

![Result ](https://user-images.githubusercontent.com/68400102/152212391-5d2ececa-a91d-47a4-ad17-1e007d03ebf9.png)
