package com.example.base;

import com.example.constant.ApiPath;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.annotation.*;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@RestController
@RequestMapping(ApiPath.API_V1)
public @interface RestApiV1 {
}
