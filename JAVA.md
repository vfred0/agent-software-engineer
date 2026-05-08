---
description: "Guide for Software Engineer best practices: Java and Spring Boot"
---

## Project Structure

### For Modular Monoliths
```text
├───docs
│   │   README.adoc
│   │   
│   ├───images
│   │   ├───1-class-diagram
│   │   │       class-diagram.svg
│   │   │       
│   │   ├───2-activity
│   │   │       activity-diagram.svg
│   │   │       
│   │   └───3-states
│   │           state-diagram.svg
│   │           
│   └───src
│       ├───1-class-diagram
│       │       class-diagram.puml
│       │       
│       ├───2-activity
│       │       activity-diagram.puml
│       │       
│       ├───3-states
│       │       state-diagram.puml
│       │       
│       └───utils
│               class-relationship.puml
│               directions.puml
│               settings.puml
│               states.puml
│               theme.puml
│               
└───src
    ├───main
    │   ├───java
    │   │   └───com
    │   │       └───example
    │   │           └───demo
    │   │               │   DemoApplication.java
    │   │               │   
    │   │               ├───api
    │   │               │   ├───dtos
    │   │               │   │       AddressDto.java
    │   │               │   │       CustomerPatchDto.java
    │   │               │   │       
    │   │               │   ├───exceptions
    │   │               │   │       NotFoundException.java
    │   │               │   │       
    │   │               │   └───resources
    │   │               │           CustomerSingleResource.java
    │   │               │               
    │   │               ├───config
    │   │               │       SecurityConfiguration.java
    │   │               │           
    │   │               ├───data
    │   │               │   ├───daos
    │   │               │   │       IRepository.java
    │   │               │   │           
    │   │               │   └───entities
    │   │               │           Customer.java
    │   │               │               
    │   │               └───service
    │   │                   ├───operations
    │   │                   │       Result.java
    │   │                   │               
    │   │                   ├───integration
    │   │                   │       MobilvendorApiService.java
    │   │                   │           
    │   │                   └───internal
    │   │                           CustomerService.java
    │   │                               
    │   └───resources
    │           application.yml
    │           customers.http