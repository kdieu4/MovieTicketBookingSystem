package com.mtbs.auth_service.repository;


import com.mtbs.auth_service.domain.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    @Query(value = "select r from Role r inner join UserHasRole ur on r.id = ur.user.id where user.id=:userId")
    List<Role> getAllByUserId(Long userId);
}
